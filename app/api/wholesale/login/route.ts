import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import {
  WHOLESALE_COOKIE,
  WHOLESALE_SESSION_MAX_AGE,
  createCompanySessionToken,
  verifyPassword,
} from '../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!process.env.WHOLESALE_SESSION_SECRET) {
      return NextResponse.json({ error: 'Wholesale login is not configured on the server.' }, { status: 500 });
    }

    const { username, password } = await req.json();
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    // Slows brute force attempts down to a few tries per second.
    await new Promise((resolve) => setTimeout(resolve, 400));

    const company = await prisma.company.findUnique({ where: { username: username.trim() } });
    if (!company || !(await verifyPassword(password, company.passwordHash))) {
      return NextResponse.json({ error: 'Wrong username or password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, company: { id: company.id, name: company.name } });
    response.cookies.set(WHOLESALE_COOKIE, await createCompanySessionToken(company.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: WHOLESALE_SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
