import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendTelegramNotification } from '../../../../lib/telegram';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.event === 'payment_intent.status.updated' && payload.data) {
      const intentId = payload.data.id;
      const status = payload.data.status;
      
      await sendTelegramNotification(`🔧 <b>DEBUG Webhook:</b> Intent ${intentId} updated to ${status}`);

      if (!intentId) return NextResponse.json({ error: "No intent ID" }, { status: 400 });

      if (status === 'COMPLETED' || status === 'PAID') {
        const updatedOrders = await prisma.order.findMany({
          where: { paymentIntentId: intentId }
        });

        await prisma.order.updateMany({
          where: { paymentIntentId: intentId },
          data: { status: 'Paid' }
        });

        for (const order of updatedOrders) {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          // @ts-ignore
          const itemDetails = Array.isArray(items) ? items.map((i: any) => `${i.quantity}x ${i.name}`).join('\n') : 'Items';
          
          const message = `✅ <b>Online Payment Received!</b>
          
👤 <b>Name:</b> ${order.name}
📞 <b>Phone:</b> ${order.phone}
📍 <b>Address:</b> ${order.address}
💰 <b>Total:</b> ${order.total} AED
🛒 <b>Items:</b>
${itemDetails}`;
          
          await sendTelegramNotification(message);
        }
      } else if (status === 'CANCELED' || status === 'FAILED') {
        await prisma.order.updateMany({
          where: { paymentIntentId: intentId },
          data: { status: 'Failed' }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    await sendTelegramNotification(`🔧 <b>DEBUG Webhook Error:</b> ${error?.message || 'Unknown'}`);
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
