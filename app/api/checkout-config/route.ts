import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { FALLBACK_ESTIMATES, parseEstimates, SETTINGS_KEY } from '../../../lib/delivery';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Public endpoint: only shop-wide settings a shopper is allowed to see.
    const rows = await prisma.settings.findMany({
      where: { key: { in: ['ziina_enabled', SETTINGS_KEY] } },
    });
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // Default to true if not set
    const isEnabled = byKey.ziina_enabled ? byKey.ziina_enabled === 'true' : true;

    return NextResponse.json({
      ziinaEnabled: isEnabled,
      deliveryEstimates: parseEstimates(byKey[SETTINGS_KEY]),
    });
  } catch (error) {
    // Checkout must still work if the settings read fails.
    return NextResponse.json({ ziinaEnabled: false, deliveryEstimates: FALLBACK_ESTIMATES });
  }
}
