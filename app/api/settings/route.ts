import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

// These hold live payment and bot credentials. Both handlers are admin-only
// (enforced in proxy.ts); the shop reads what it needs from /api/checkout-config.
const ALLOWED_KEYS = new Set([
  'ziina_api_key',
  'ziina_enabled',
  'ziina_test_mode',
  'telegram_bot_token',
  'telegram_chat_id',
  'track_stock'
]);

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    // Convert array of {key, value} to object
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Body is an object of key: value
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) continue;
      await prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
