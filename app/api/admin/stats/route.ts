import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalOrders, activeOrders, totalProducts, totalRevenueAgg] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { not: 'Delivered' } } }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'Delivered' }
      })
    ]);

    return NextResponse.json({
      totalOrders,
      activeOrders,
      totalProducts,
      totalRevenue: totalRevenueAgg._sum.total || 0
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
