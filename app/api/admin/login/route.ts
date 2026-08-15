import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE, checkAdminPassword, createSessionToken } from '../../../../lib/auth';
import {
  LOGIN_LIMIT,
  LOGIN_WINDOW_MS,
  checkRateLimit,
  clearRateLimit,
  clientIp,
  tooManyAttempts,
} from '../../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        { error: 'Admin login is not configured on the server.' },
        { status: 500 }
      );
    }

    // A single shared password guards the whole shop, so the number of guesses
    // an attacker gets is the security boundary. Checked before the password is
    // even read, so a blocked IP cannot use this route to test anything.
    const limitKey = `admin-login:${clientIp(req)}`;
    const limit = checkRateLimit(limitKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);
    if (!limit.allowed) return tooManyAttempts(limit.retryAfter);

    const { password } = await req.json();

    // Adds a fixed cost to every attempt. It does not throttle on its own —
    // parallel requests each sleep concurrently — which is what the rate limit
    // above is for.
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    // Correct password: the owner mistyping theirs a few times should not eat
    // into the window that protects them.
    clearRateLimit(limitKey);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
