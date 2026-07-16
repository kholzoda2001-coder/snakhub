import { getSettings } from './settings';

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
