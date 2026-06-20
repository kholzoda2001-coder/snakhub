import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { sendTelegramNotification } from '../../../../../lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If already Paid, just return success
    if (order.status === 'Paid') {
      return NextResponse.json(order);
    }

    // If pending payment and has a paymentIntentId, verify with Ziina
    if (order.status === 'Pending Payment' && order.paymentIntentId) {
      const setting = await prisma.settings.findUnique({ where: { key: 'ziina_api_key' } });
      const apiKey = setting?.value || process.env.ZIINA_API_KEY;
      
      if (!apiKey) {
        return NextResponse.json(order);
      }

      const ziinaRes = await fetch(`https://api-v2.ziina.com/api/payment_intent/${order.paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (ziinaRes.ok) {
        const ziinaData = await ziinaRes.json();
        
        // Debug notification
        await sendTelegramNotification(`🔧 <b>DEBUG:</b> Verify called for Order ${orderId}. Ziina Status: ${ziinaData.status}`);

        if (ziinaData.status === 'COMPLETED' || ziinaData.status === 'PAID') {
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Paid' }
          });
          
          const items = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items;
          // @ts-ignore
          const itemDetails = Array.isArray(items) ? items.map((i: any) => `${i.quantity}x ${i.name}`).join('\n') : 'Items';
          
          const message = `✅ <b>Online Payment Received!</b>
          
👤 <b>Name:</b> ${updatedOrder.name}
📞 <b>Phone:</b> ${updatedOrder.phone}
📍 <b>Address:</b> ${updatedOrder.address}
💰 <b>Total:</b> ${updatedOrder.total} AED
🛒 <b>Items:</b>
${itemDetails}`;
          
          await sendTelegramNotification(message);

          return NextResponse.json(updatedOrder);
        } else if (ziinaData.status === 'CANCELED' || ziinaData.status === 'FAILED') {
           const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Failed' }
          });
          return NextResponse.json(updatedOrder);
        }
      } else {
        await sendTelegramNotification(`🔧 <b>DEBUG:</b> Ziina API failed with status ${ziinaRes.status}`);
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    await sendTelegramNotification(`🔧 <b>DEBUG:</b> Error in verify route: ${error?.message || 'Unknown error'}`);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
