/**
 * Fixed-window rate limiting for the login routes.
 *
 * The 400ms delay that used to guard /api/admin/login did nothing: `await` frees
 * the event loop, so thirty parallel guesses finished in about a second. This
 * counts attempts per IP and refuses once the window is spent, which is the part
 * that actually costs an attacker time.
 *
 * State lives in module memory. On a single server that is exact; on serverless
 * it is per-instance, so a spread-out attacker gets one window per warm instance
 * rather than one overall. That is still orders of magnitude better than nothing,
 * but if this shop ever runs on more than a couple of instances the counters
 * belong in Redis/Upstash instead — the call sites below would not change.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Without this the map keeps a row per attacking IP forever, which is its own
// denial of service. Cleared on write, not on a timer, so an idle server does
// no work at all.
const CLEANUP_THRESHOLD = 5_000;

function sweepExpired(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets — sent as Retry-After when blocked. */
  retryAfter: number;
  remaining: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (windows.size > CLEANUP_THRESHOLD) sweepExpired(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0, remaining: limit - 1 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, retryAfter, remaining: 0 };
  }

  return { allowed: true, retryAfter, remaining: limit - existing.count };
}

/**
 * Wipes an IP's counter. Called after a correct password so a shop owner who
 * fumbled their password four times is not locked out of their own admin.
 */
export function clearRateLimit(key: string) {
  windows.delete(key);
}

/**
 * The caller's address. On Vercel every request carries x-forwarded-for, whose
 * first entry is the real client; the rest are proxies and are attacker-settable,
 * so only the first is used. Requests with no forwarded header share the
 * "unknown" bucket, which is the safe direction to fail: a missing IP gets
 * rate limited alongside every other missing IP rather than escaping the limit.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Login attempts allowed per IP per window, and the window itself. */
export const LOGIN_LIMIT = 8;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function tooManyAttempts(retryAfter: number) {
  const minutes = Math.ceil(retryAfter / 60);
  return Response.json(
    { error: `Too many login attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
