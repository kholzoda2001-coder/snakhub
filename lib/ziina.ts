import { getSettings } from './settings';
import { prisma } from './prisma';

const ZIINA_API = 'https://api-v2.ziina.com/api/payment_intent';

export type ZiinaConfig = {
  apiKey?: string;
  isTestMode: boolean;
  isEnabled: boolean;
};

export async function getZiinaConfig(): Promise<ZiinaConfig> {
  const settings = await getSettings(['ziina_api_key', 'ziina_test_mode', 'ziina_enabled']);
  return {
    apiKey: settings.ziina_api_key || process.env.ZIINA_API_KEY,
    isTestMode: settings.ziina_test_mode ? settings.ziina_test_mode === 'true' : true,
    isEnabled: settings.ziina_enabled ? settings.ziina_enabled === 'true' : true,
  };
}

export async function createPaymentIntent(payload: Record<string, unknown>, apiKey: string) {
  const res = await fetch(ZIINA_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('Ziina create intent failed:', res.status, await res.text());
    return null;
  }
  return res.json();
}

/**
 * Asks Ziina what a payment intent's real status is. Webhook payloads are
 * unauthenticated, so nothing is trusted until it is confirmed here.
 */
export async function fetchPaymentIntent(intentId: string) {
  const { apiKey } = await getZiinaConfig();
  if (!apiKey) return null;

  const res = await fetch(`${ZIINA_API}/${encodeURIComponent(intentId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.error('Ziina fetch intent failed:', res.status, await res.text());
    return null;
  }
  return res.json();
}

export function isPaidStatus(status: unknown) {
  return status === 'COMPLETED' || status === 'PAID';
}

export function isFailedStatus(status: unknown) {
  return status === 'CANCELED' || status === 'CANCELLED' || status === 'FAILED' || status === 'EXPIRED';
}

/**
 * Ziina's published business rate for QR/link/NFC receipts: 2.6% + 1 AED,
 * plus 5% VAT on the fee itself. Cards issued outside the UAE cost Ziina (and
 * so us) an extra 1.5% that the payment intent does not expose, so this is a
 * floor — the real deduction can run higher for non-AED cards.
 */
export function estimateZiinaFee(orderTotal: number): number {
  const fee = orderTotal * 0.026 + 1;
  return Math.round(fee * 1.05 * 100) / 100;
}

/**
 * Books the estimated Ziina fee as a Payment Fees expense the first time an
 * order is marked Fulfilled. Keyed by order id in the note (not a DB
 * constraint) so re-toggling fulfillment on the same order cannot double-book
 * it — the caller does not need to track whether this is a first transition.
 */
export async function logZiinaFeeOnce(order: { id: number; total: number; createdAt: Date }) {
  const note = `Ziina fee — Order #${order.id}`;
  const existing = await prisma.expense.findFirst({ where: { category: 'Payment Fees', note } });
  if (existing) return;

  await prisma.expense.create({
    data: {
      date: order.createdAt,
      category: 'Payment Fees',
      amount: estimateZiinaFee(order.total),
      paidWith: 'card',
      note,
    },
  });
}
