import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE, checkAdminPassword, createSessionToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        { error: 'Admin login is not configured on the server.' },
        { status: 500 }
      );
    }

    const { password } = await req.json();

    // Slows brute force attempts down to a few tries per second.
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

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
