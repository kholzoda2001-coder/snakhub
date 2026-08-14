import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Both figures below used to key off `status: 'Delivered'` — a value this
 * schema never writes. `status` holds the payment state (Pending, Pending
 * Payment, Paid, Failed) and delivery lives in `fulfillment`. The result was a
 * dashboard that read "0 AED" no matter how much the shop sold, and an active
 * order count that could never go down.
 *
 * The definition of revenue here matches lib/accounting.ts — money is real once
 * the order is fulfilled — so the dashboard and the books cannot disagree.
 */
export async function GET() {
  try {
    const [totalOrders, activeOrders, totalProducts, totalRevenueAgg] = await Promise.all([
      prisma.order.count(),
      // Still needs someone to act on it: not delivered, not cancelled, and not
      // an abandoned or failed checkout that nobody is going to pack.
      prisma.order.count({
        where: {
          fulfillment: { notIn: ['Fulfilled', 'Cancelled'] },
          status: { notIn: ['Failed', 'Pending Payment'] },
        }
      }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { fulfillment: 'Fulfilled' }
      })
    ]);

    return NextResponse.json({
      totalOrders,
      activeOrders,
      totalProducts,
      totalRevenue: totalRevenueAgg._sum.total || 0
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
