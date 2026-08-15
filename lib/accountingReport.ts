import { prisma } from './prisma';
import { buildLedger, computeTotals, type Totals, type Transaction } from './accounting';

export type AccountingReport = {
  from: Date | null;
  to: Date | null;
  totals: Totals;
  /** Newest first, uncapped — callers that render a preview slice it themselves. */
  ledger: Transaction[];
  inventory: { productsWithoutCost: number; productCount: number };
  paymentFees: { total: number; count: number };
  expenses: { id: number; date: Date; category: string; amount: number; paidWith: string; note: string | null }[];
};

/** Thrown when `from`/`to` cannot be parsed as dates. */
export class InvalidRangeError extends Error {}

/**
 * The books for one date range, shared by the on-screen report and the PDF
 * export so the two can never disagree with each other.
 */
export async function buildAccountingReport(fromParam: string | null, toParam: string | null): Promise<AccountingReport> {
  const from = fromParam ? new Date(fromParam) : null;
  const to = toParam ? new Date(toParam) : null;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
    throw new InvalidRangeError('Invalid date range.');
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
    // Stock here is drop-shipped, not owned — the count is the supplier's
    // availability, not paid-for inventory, so it is never valued as an asset.
    prisma.product.findMany({ select: { cost: true } }),
  ]);

  const totals = computeTotals(orders, expenses);
  const ledger = buildLedger(orders, expenses);

  const productsWithoutCost = products.filter((p) => !p.cost || p.cost <= 0).length;

  // Auto-booked when a card order is marked Fulfilled (see logZiinaFeeOnce) —
  // surfaced on its own so the estimate is visible, not just buried in Expenses.
  const paymentFeeExpenses = expenses.filter((e) => e.category === 'Payment Fees');
  const paymentFees = {
    total: Math.round(paymentFeeExpenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100,
    count: paymentFeeExpenses.length,
  };

  return {
    from,
    to,
    totals,
    ledger,
    inventory: { productsWithoutCost, productCount: products.length },
    paymentFees,
    expenses,
  };
}
