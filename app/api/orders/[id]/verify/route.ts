import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
        if (ziinaData.status === 'COMPLETED' || ziinaData.status === 'PAID') {
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Paid' }
          });
          return NextResponse.json(updatedOrder);
        } else if (ziinaData.status === 'CANCELED' || ziinaData.status === 'FAILED') {
           const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Failed' }
          });
          return NextResponse.json(updatedOrder);
        }
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
