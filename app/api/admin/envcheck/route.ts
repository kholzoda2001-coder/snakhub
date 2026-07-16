import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// TEMPORARY diagnostic: reports only whether the admin env vars are visible to
// the deployment (booleans + lengths, never the values). Delete after use.
export async function GET() {
  const pw = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  return NextResponse.json({
    hasPassword: typeof pw === 'string' && pw.length > 0,
    passwordLen: pw ? pw.length : 0,
    hasSecret: typeof secret === 'string' && secret.length > 0,
    secretLen: secret ? secret.length : 0,
    // Surfaces a trailing-space-in-the-name style problem: the real names would
    // be missing while a look-alike key is present.
    adminKeys: Object.keys(process.env).filter((k) => k.toUpperCase().includes('ADMIN')),
    nodeEnv: process.env.NODE_ENV,
  });
}
