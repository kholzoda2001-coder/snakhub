import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

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
