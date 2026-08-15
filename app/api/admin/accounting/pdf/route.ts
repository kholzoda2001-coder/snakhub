import { NextResponse } from 'next/server';
import { buildAccountingReport, InvalidRangeError } from '../../../../../lib/accountingReport';
import { renderAccountingPdf } from '../../../../../lib/accountingPdf';
import { requireAdmin } from '../../../../../lib/adminGuard';

export const dynamic = 'force-dynamic';

/**
 * The same report as GET /api/admin/accounting, laid out as a downloadable
 * PDF instead of JSON. Admin only — proxy.ts denies anything under /api that
 * is not allowlisted.
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const report = await buildAccountingReport(searchParams.get('from'), searchParams.get('to'));
    const pdf = await renderAccountingPdf(report);

    const stamp = new Date().toISOString().slice(0, 10);
    const rangeSuffix = report.from || report.to
      ? `_${report.from ? report.from.toISOString().slice(0, 10) : 'start'}-${report.to ? report.to.toISOString().slice(0, 10) : 'today'}`
      : '_all-time';

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="snackhub-accounting${rangeSuffix}_${stamp}.pdf"`,
        'Content-Length': String(pdf.length),
      },
    });
  } catch (error) {
    if (error instanceof InvalidRangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Accounting PDF failed:', error);
    return NextResponse.json({ error: 'Failed to build the PDF' }, { status: 500 });
  }
}
