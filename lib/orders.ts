import { prisma } from './prisma';
import { getSetting } from './settings';
import { buildOrderMessage, sendTelegramNotification } from './telegram';

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  catLabel: string;
  isOfferEligible: boolean;
};

export async function isStockTrackingOn() {
  return (await getSetting('track_stock')) === 'true';
}

/**
 * Puts reserved units back when a payment never completes.
 */
export async function restoreStock(items: unknown) {
  if (!(await isStockTrackingOn())) return;

  let parsed = items;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return; }
  }
  if (!Array.isArray(parsed)) return;

  for (const item of parsed as any[]) {
    const id = Number(item?.id);
    const qty = Number(item?.qty ?? item?.quantity);
    if (!Number.isInteger(id) || !Number.isFinite(qty) || qty < 1) continue;
    try {
      await prisma.product.update({ where: { id }, data: { stock: { increment: qty } } });
    } catch (error) {
      console.error(`Failed to restore stock for product ${id}:`, error);
    }
  }
}

type OrderRow = {
  id: number;
  name: string;
  phone: string;
  address: string;
  total: number;
  items: unknown;
  status: string;
};

/**
 * Both the Ziina webhook and the customer's return from checkout can land here
 * for the same order. The guarded update means only the first one wins, so the
 * shop never gets two Telegram messages for one payment.
 */
export async function markOrderPaid(order: OrderRow) {
  const result = await prisma.order.updateMany({
    where: { id: order.id, status: { not: 'Paid' } },
    data: { status: 'Paid' },
  });
  if (result.count === 0) return false;

  await sendTelegramNotification(buildOrderMessage('✅ <b>Online Payment Received!</b>', order));
  return true;
}

export async function markOrderFailed(order: OrderRow) {
  const result = await prisma.order.updateMany({
    where: { id: order.id, status: 'Pending Payment' },
    data: { status: 'Failed' },
  });
  if (result.count === 0) return false;

  await restoreStock(order.items);
  return true;
}
