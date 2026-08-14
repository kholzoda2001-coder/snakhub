/**
 * The shopper's own order history, kept on their device.
 *
 * Every order already lives in the database, but the shop has no accounts, so
 * there is nothing to tie a returning visitor to their rows. Looking orders up
 * by phone number would let anyone type someone else's number and read their
 * orders, so instead each browser remembers the orders it placed and asks the
 * public verify endpoint for the current status of those specific ids.
 *
 * Consequence worth knowing: history is per browser. Ordering on a phone and
 * then opening the site on a laptop shows an empty list.
 */

const KEY = 'snackhub_orders';
/** Plenty for a shopper, and keeps the entry well clear of storage limits. */
const MAX_ORDERS = 50;

export type StoredOrderItem = { name: string; qty: number; price: number };

export type StoredOrder = {
  id: number;
  placedAt: string;
  items: StoredOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

function read(): StoredOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((o) => typeof o?.id === 'number') : [];
  } catch {
    // Corrupt or blocked storage should never take the page down.
    return [];
  }
}

function write(orders: StoredOrder[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(orders.slice(0, MAX_ORDERS)));
  } catch {
    // Private browsing or a full quota — history is a convenience, not critical.
  }
}

/** Newest first. */
export function getOrders(): StoredOrder[] {
  return read().sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
}

export function getOrder(id: number | string | null): StoredOrder | null {
  const wanted = Number(id);
  if (!Number.isFinite(wanted)) return null;
  return read().find((o) => o.id === wanted) ?? null;
}

/** Records a freshly placed order, replacing any earlier entry with the same id. */
export function saveOrder(order: StoredOrder): void {
  const existing = read().filter((o) => o.id !== order.id);
  write([order, ...existing]);
}
