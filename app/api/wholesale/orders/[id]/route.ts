import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentCompanyId } from '../../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const companyId = await getCurrentCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { id } = await context.params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { company: { select: { name: true, phone: true } } },
  });

  // A company must never see another company's order, even by guessing an id.
  if (!order || order.companyId !== companyId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}
