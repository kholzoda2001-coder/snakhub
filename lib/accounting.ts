/**
 * The shop's books.
 *
 * One rule decides everything here: **money is only real once the order is
 * fulfilled**. A placed order is a promise, not revenue — 13 of the orders in
 * this database were abandoned at the payment step and must never be counted.
 *
 * Cash and card are kept apart because they behave differently: cash is
 * collected by the driver and sits in a drawer, card money is taken by Ziina.
 */

export type AccountingOrder = {
  id: number;
  total: number;
  status: string;
  fulfillment: string;
  paymentIntentId: string | null;
  createdAt: Date | string;
  items: unknown;
};

export type AccountingExpense = {
  id: number;
  date: Date | string;
  category: string;
  amount: number;
  paidWith: string;
  note?: string | null;
};

export type Totals = {
  /** Fulfilled orders only. */
  revenue: number;
  /** What the goods in those orders cost to buy. */
  costOfGoods: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;

  cashCollected: number;
  cardCollected: number;
  cashExpenses: number;
  cardExpenses: number;
  cashOnHand: number;
  cardBalance: number;

  /** Sold but not yet delivered — money you are owed, not money you have. */
  pendingCash: number;
  pendingCard: number;

  fulfilledOrders: number;
  /** Fulfilled orders whose items carry no cost, so profit is understated. */
  ordersMissingCost: number;
};

/** An order only becomes money once it has actually been delivered. */
export function isRealised(order: AccountingOrder): boolean {
  return order.fulfillment === 'Fulfilled';
}

export function isCard(order: AccountingOrder): boolean {
  return Boolean(order.paymentIntentId);
}

function itemsOf(order: AccountingOrder): { price?: number; cost?: number; qty?: number }[] {
  const raw = order.items;
  if (Array.isArray(raw)) return raw as { price?: number; cost?: number; qty?: number }[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Buy-price total for one order. Items with no recorded cost contribute 0. */
export function orderCost(order: AccountingOrder): number {
  return itemsOf(order).reduce((sum, item) => sum + (item.cost ?? 0) * (item.qty ?? 0), 0);
}

/** True when the order sold something whose cost was never recorded. */
export function hasMissingCost(order: AccountingOrder): boolean {
  const items = itemsOf(order);
  if (items.length === 0) return false;
  return items.some((item) => !item.cost || item.cost <= 0);
}

const round = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(orders: AccountingOrder[], expenses: AccountingExpense[]): Totals {
  let revenue = 0, costOfGoods = 0;
  let cashCollected = 0, cardCollected = 0;
  let pendingCash = 0, pendingCard = 0;
  let fulfilledOrders = 0, ordersMissingCost = 0;

  for (const order of orders) {
    if (order.fulfillment === 'Cancelled') continue;

    if (isRealised(order)) {
      revenue += order.total;
      costOfGoods += orderCost(order);
      fulfilledOrders++;
      if (hasMissingCost(order)) ordersMissingCost++;
      if (isCard(order)) cardCollected += order.total;
      else cashCollected += order.total;
    } else if (order.status !== 'Failed' && order.status !== 'Pending Payment') {
      // Placed and payable, but not delivered yet: owed, not held.
      if (isCard(order)) pendingCard += order.total;
      else pendingCash += order.total;
    }
  }

  let cashExpenses = 0, cardExpenses = 0;
  for (const e of expenses) {
    if (e.paidWith === 'cash') cashExpenses += e.amount;
    else cardExpenses += e.amount;
  }

  const expensesTotal = cashExpenses + cardExpenses;
  const grossProfit = revenue - costOfGoods;

  return {
    revenue: round(revenue),
    costOfGoods: round(costOfGoods),
    grossProfit: round(grossProfit),
    expenses: round(expensesTotal),
    netProfit: round(grossProfit - expensesTotal),
    cashCollected: round(cashCollected),
    cardCollected: round(cardCollected),
    cashExpenses: round(cashExpenses),
    cardExpenses: round(cardExpenses),
    cashOnHand: round(cashCollected - cashExpenses),
    cardBalance: round(cardCollected - cardExpenses),
    pendingCash: round(pendingCash),
    pendingCard: round(pendingCard),
    fulfilledOrders,
    ordersMissingCost,
  };
}

export type Transaction = {
  id: string;
  date: string;
  kind: 'sale' | 'expense';
  label: string;
  method: 'cash' | 'card';
  /** Positive for money in, negative for money out. */
  amount: number;
};

/** Sales and expenses merged into one ledger, newest first. */
export function buildLedger(orders: AccountingOrder[], expenses: AccountingExpense[]): Transaction[] {
  const rows: Transaction[] = [];

  for (const order of orders) {
    if (!isRealised(order)) continue;
    rows.push({
      id: `order-${order.id}`,
      date: new Date(order.createdAt).toISOString(),
      kind: 'sale',
      label: `Order #${order.id}`,
      method: isCard(order) ? 'card' : 'cash',
      amount: order.total,
    });
  }

  for (const e of expenses) {
    rows.push({
      id: `expense-${e.id}`,
      date: new Date(e.date).toISOString(),
      kind: 'expense',
      label: e.note ? `${e.category} — ${e.note}` : e.category,
      method: e.paidWith === 'cash' ? 'cash' : 'card',
      amount: -e.amount,
    });
  }

  return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
}
