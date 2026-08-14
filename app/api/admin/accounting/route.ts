import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { buildLedger, computeTotals } from '../../../../lib/accounting';

export const dynamic = 'force-dynamic';

/**
 * The books, computed server-side so the browser never has to hold every order.
 * Admin only — proxy.ts denies anything under /api that is not allowlisted.
 *
 * `from`/`to` are ISO dates; omitting them reports on all trading history.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const from = fromParam ? new Date(fromParam) : null;
    const to = toParam ? new Date(toParam) : null;
    if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
      return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 });
    }
    // `to` arrives as a plain day; include everything that happened during it.
    if (to) to.setHours(23, 59, 59, 999);

    const range = from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};
    const expenseRange = from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};

    const [orders, expenses, products] = await Promise.all([
      prisma.order.findMany({
        where: range,
        select: { id: true, total: true, status: true, fulfillment: true, paymentIntentId: true, createdAt: true, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.expense.findMany({ where: expenseRange, orderBy: { date: 'desc' } }),
      prisma.product.findMany({ select: { id: true, name: true, price: true, cost: true, stock: true } }),
    ]);

    const totals = computeTotals(orders, expenses);
    const ledger = buildLedger(orders, expenses).slice(0, 100);

    // Stock is valued at what it cost, not what it might sell for — that is the
    // money actually tied up on the shelf.
    const stockAtCost = products.reduce((sum, p) => sum + (p.stock ?? 0) * (p.cost ?? 0), 0);
    const stockAtRetail = products.reduce((sum, p) => sum + (p.stock ?? 0) * p.price, 0);
    const productsWithoutCost = products.filter((p) => !p.cost || p.cost <= 0).length;

    return NextResponse.json({
      totals,
      ledger,
      inventory: {
        stockAtCost: Math.round(stockAtCost * 100) / 100,
        stockAtRetail: Math.round(stockAtRetail * 100) / 100,
        productsWithoutCost,
        productCount: products.length,
      },
      expenses,
    });
  } catch (error) {
    console.error('Accounting report failed:', error);
    return NextResponse.json({ error: 'Failed to build the report' }, { status: 500 });
  }
}
