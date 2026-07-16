import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { markOrderFailed, markOrderPaid } from '../../../../../lib/orders';
import { fetchPaymentIntent, isFailedStatus, isPaidStatus } from '../../../../../lib/ziina';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // This route is public — the customer lands here straight after paying — so
    // it returns payment state only, never the customer's details.
    const publicView = (status: string) => ({
      id: orderId,
      status,
      total: order.total,
      isOnline: Boolean(order.paymentIntentId)
    });

    if (order.status !== 'Pending Payment' || !order.paymentIntentId) {
      return NextResponse.json(publicView(order.status));
    }

    const intent = await fetchPaymentIntent(order.paymentIntentId);
    if (!intent) return NextResponse.json(publicView(order.status));

    if (isPaidStatus(intent.status)) {
      await markOrderPaid(order);
      return NextResponse.json(publicView('Paid'));
    }

    if (isFailedStatus(intent.status)) {
      await markOrderFailed(order);
      return NextResponse.json(publicView('Failed'));
    }

    return NextResponse.json(publicView(order.status));
  } catch (error) {
    console.error('Error verifying order:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
