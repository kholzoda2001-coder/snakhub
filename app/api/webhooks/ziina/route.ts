import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.event === 'payment_intent.status.updated' && payload.data) {
      const intentId = payload.data.id;
      const status = payload.data.status;

      if (!intentId) return NextResponse.json({ error: "No intent ID" }, { status: 400 });

      if (status === 'COMPLETED' || status === 'PAID') {
        await prisma.order.updateMany({
          where: { paymentIntentId: intentId },
          data: { status: 'Paid' }
        });
      } else if (status === 'CANCELED' || status === 'FAILED') {
        await prisma.order.updateMany({
          where: { paymentIntentId: intentId },
          data: { status: 'Failed' }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
