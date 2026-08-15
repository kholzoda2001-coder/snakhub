import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from './auth';

/**
 * The second lock on every admin route.
 *
 * proxy.ts already refuses these requests, and it is still the primary gate —
 * but it is one file, and one wrong entry in its public-path list silently
 * publishes the orders table or the settings that hold the live payment key.
 * Next's own docs warn against making proxy the only authorization check for
 * exactly this reason, and the middleware bypass class of bug (CVE-2025-29927)
 * is what it looks like when that assumption breaks.
 *
 * Usage — first statement in the handler, before anything is read or written:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 *
 * Returns null when the caller holds a valid admin session, so `if (denied)`
 * reads as "stop here".
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
