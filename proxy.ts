import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

// TEMPORARY: admin login depends on Vercel env vars that aren't loading yet.
// Until that's fixed, the admin panel is open WITHOUT a password so the owner can
// manage products and orders. The payment/bot credentials endpoint (/api/settings)
// stays locked so nobody can scrape the Ziina key or Telegram token.
// To restore full protection: set this to false (once env-var login works) and,
// after confirming, delete this block entirely.
const TEMP_OPEN_ADMIN = true;

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Endpoints a customer must be able to reach without logging in.
function isPublicRequest(pathname: string, method: string, search: URLSearchParams) {
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') return true;
  if (pathname === '/api/webhooks/ziina') return true;
  if (pathname === '/api/checkout-config') return true;
  if (pathname.startsWith('/api/images/')) return true;

  // Customers place orders and check their own payment status.
  if (pathname === '/api/orders' && method === 'POST') return true;
  if (/^\/api\/orders\/\d+\/verify$/.test(pathname) && method === 'GET') return true;

  // The shop itself only ever reads. `?admin=true` returns raw image data, so it stays private.
  if (method === 'GET' && !WRITE_METHODS.has(method)) {
    if (search.get('admin') === 'true') return false;
    if (
      pathname === '/api/products' ||
      pathname.startsWith('/api/products/') ||
      pathname === '/api/categories' ||
      pathname.startsWith('/api/categories/') ||
      pathname === '/api/banners' ||
      pathname.startsWith('/api/banners/') ||
      pathname === '/api/pages' ||
      pathname.startsWith('/api/pages/')
    ) {
      return true;
    }
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;

  if (pathname === '/admin/login') return NextResponse.next();
  if (isPublicRequest(pathname, method, searchParams)) return NextResponse.next();

  // While admin is temporarily open, allow everything EXCEPT the credentials
  // endpoint, which must never be exposed to the public internet.
  if (TEMP_OPEN_ADMIN && pathname !== '/api/settings') {
    return NextResponse.next();
  }

  const isLoggedIn = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (isLoggedIn) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
