import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/adminGuard';

export const dynamic = 'force-dynamic';

// These hold live payment and bot credentials. Both handlers are admin-only
// (enforced in proxy.ts); the shop reads what it needs from /api/checkout-config.
const ALLOWED_KEYS = new Set([
  'ziina_api_key',
  'ziina_enabled',
  'ziina_test_mode',
  'telegram_bot_token',
  'telegram_chat_id',
  'track_stock',
  'delivery_estimates'
]);

/**
 * Credentials that let someone take money or post as the shop. These are never
 * sent back to a browser — the settings form used to receive the live Ziina
 * secret key in plain text on every page load and hold it in a form field.
 * The form reports whether one is stored; the value itself only travels inward.
 */
const SECRET_KEYS = new Set(['ziina_api_key', 'telegram_bot_token']);

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce<Record<string, string>>((acc, curr) => {
      if (SECRET_KEYS.has(curr.key)) {
        // Blank value, plus a flag so the form can say "a key is saved".
        acc[curr.key] = '';
        acc[`${curr.key}_set`] = curr.value.trim() ? 'true' : 'false';
        return acc;
      }
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Writes the live Ziina key and Telegram bot token.
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();

    // Body is an object of key: value
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) continue;

      // An empty secret means "leave the stored one alone". Without this, the
      // form — which posts every field on every save — would blank the live
      // payment key the first time it was saved after the redaction above,
      // silently taking card payments down.
      if (SECRET_KEYS.has(key) && String(value ?? '').trim() === '') continue;

      await prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
