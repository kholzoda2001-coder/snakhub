import { cookies } from 'next/headers';
import { safeEqual } from './auth';

export const WHOLESALE_COOKIE = 'sh_wholesale';
// Companies log in far less often than the admin does, so the session is
// long-lived — logging back in every 12 hours would be a real friction point.
export const WHOLESALE_SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function secret() {
  const value = process.env.WHOLESALE_SESSION_SECRET;
  if (!value) throw new Error('WHOLESALE_SESSION_SECRET is not set');
  return value;
}

async function hmac(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export async function createCompanySessionToken(companyId: number) {
  const expiresAt = String(Date.now() + WHOLESALE_SESSION_MAX_AGE * 1000);
  const payload = `${companyId}.${expiresAt}`;
  return `${payload}.${await hmac(payload)}`;
}

/** Returns the companyId encoded in a valid, unexpired token, or null. */
export async function verifyCompanySessionToken(token: string | undefined | null): Promise<number | null> {
  if (!token) return null;
  try {
    const [companyIdRaw, expiresAt, signature] = token.split('.');
    if (!companyIdRaw || !expiresAt || !signature) return null;
    if (!safeEqual(signature, await hmac(`${companyIdRaw}.${expiresAt}`))) return null;
    if (Number(expiresAt) <= Date.now()) return null;
    const companyId = Number(companyIdRaw);
    return Number.isInteger(companyId) ? companyId : null;
  } catch {
    return null;
  }
}

/** For server components and route handlers — reads the session straight off the request cookies. */
export async function getCurrentCompanyId(): Promise<number | null> {
  const store = await cookies();
  return verifyCompanySessionToken(store.get(WHOLESALE_COOKIE)?.value);
}

const PBKDF2_ITERATIONS = 100_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return `${PBKDF2_ITERATIONS}.${toBase64Url(salt)}.${toBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [iterationsRaw, saltB64, hashB64] = stored.split('.');
    const iterations = Number(iterationsRaw);
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: fromBase64Url(saltB64), iterations, hash: 'SHA-256' },
      key,
      256
    );
    return safeEqual(toBase64Url(new Uint8Array(bits)), hashB64);
  } catch {
    return false;
  }
}
