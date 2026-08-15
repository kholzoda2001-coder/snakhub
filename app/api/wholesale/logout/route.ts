import { NextResponse } from 'next/server';
import { WHOLESALE_COOKIE } from '../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(WHOLESALE_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
