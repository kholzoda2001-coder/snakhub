import { NextResponse } from 'next/server';
import { buildAccountingReport, InvalidRangeError } from '../../../../lib/accountingReport';
import { requireAdmin } from '../../../../lib/adminGuard';

export const dynamic = 'force-dynamic';

/**
 * The books, computed server-side so the browser never has to hold every order.
 * Admin only — proxy.ts denies anything under /api that is not allowlisted.
 *
 * `from`/`to` are ISO dates; omitting them reports on all trading history.
 * The PDF export at /api/admin/accounting/pdf builds the same report.
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const report = await buildAccountingReport(searchParams.get('from'), searchParams.get('to'));

    return NextResponse.json({
      ...report,
      // The on-screen ledger is a recent-activity preview; the PDF export
      // carries the full history instead of this cap.
      ledger: report.ledger.slice(0, 100),
    });
  } catch (error) {
    if (error instanceof InvalidRangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Accounting report failed:', error);
    return NextResponse.json({ error: 'Failed to build the report' }, { status: 500 });
  }
}
