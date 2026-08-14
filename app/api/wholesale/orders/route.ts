import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentCompanyId } from '../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const companyId = await getCurrentCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      items: true,
      total: true,
      fulfillment: true,
      createdAt: true,
    },
  });

  return NextResponse.json(orders);
}
