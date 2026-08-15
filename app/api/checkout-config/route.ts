import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { FALLBACK_ESTIMATES, parseEstimates, SETTINGS_KEY } from '../../../lib/delivery';
import { toRules } from '../../../lib/categoryRules';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Public endpoint: only shop-wide settings a shopper is allowed to see.
    const [rows, categories] = await Promise.all([
      prisma.settings.findMany({ where: { key: { in: ['ziina_enabled', SETTINGS_KEY] } } }),
      prisma.category.findMany({ select: { slug: true, cardOnly: true, deliveryEstimate: true } }),
    ]);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // Default to true if not set
    const isEnabled = byKey.ziina_enabled ? byKey.ziina_enabled === 'true' : true;

    return NextResponse.json({
      ziinaEnabled: isEnabled,
      deliveryEstimates: parseEstimates(byKey[SETTINGS_KEY]),
      categoryRules: toRules(categories),
    });
  } catch (error) {
    // Checkout must still work if the settings read fails.
    console.error('Failed to load checkout config:', error);
    return NextResponse.json({ ziinaEnabled: false, deliveryEstimates: FALLBACK_ESTIMATES, categoryRules: {} });
  }
}
