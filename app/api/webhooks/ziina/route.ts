import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { markOrderFailed, markOrderPaid } from '../../../../lib/orders';
import { fetchPaymentIntent, isFailedStatus, isPaidStatus } from '../../../../lib/ziina';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload?.event !== 'payment_intent.status.updated' || !payload?.data?.id) {
      return NextResponse.json({ received: true });
    }

    const intentId = String(payload.data.id);

    // Anyone can post here, so the payload is only a hint: ask Ziina directly
    // what this intent's status really is before touching an order.
    const intent = await fetchPaymentIntent(intentId);
    if (!intent) {
      return NextResponse.json({ error: 'Could not verify payment intent' }, { status: 502 });
    }

    const orders = await prisma.order.findMany({ where: { paymentIntentId: intentId } });

    for (const order of orders) {
      if (isPaidStatus(intent.status)) {
        await markOrderPaid(order);
      } else if (isFailedStatus(intent.status)) {
        await markOrderFailed(order);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
