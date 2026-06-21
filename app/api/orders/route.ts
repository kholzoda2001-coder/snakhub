import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendTelegramNotification } from '../../../lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, address, items, total, paymentMethod } = body;
    
    const newOrder = await prisma.order.create({
      data: {
        name,
        phone,
        address,
        items,
        total,
        status: paymentMethod === 'online' ? 'Pending Payment' : 'Pending'
      }
    });

    if (paymentMethod === 'online') {
      const setting = await prisma.settings.findUnique({ where: { key: 'ziina_api_key' } });
      const testModeSetting = await prisma.settings.findUnique({ where: { key: 'ziina_test_mode' } });
      const enabledSetting = await prisma.settings.findUnique({ where: { key: 'ziina_enabled' } });
      
      const apiKey = setting?.value || process.env.ZIINA_API_KEY;
      const isTestMode = testModeSetting ? testModeSetting.value === 'true' : true;
      const isZiinaEnabled = enabledSetting ? enabledSetting.value === 'true' : true;

      if (!apiKey || !isZiinaEnabled) {
        return NextResponse.json({ error: 'Online payment is currently unavailable. Please use COD.' }, { status: 400 });
      }

      // Construct absolute URL for Ziina redirect
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host') || 'localhost:3000';
      const domain = `${protocol}://${host}`;

      const ziinaPayload = {
        amount: Math.round(total * 100), // convert to fils
        currency_code: 'AED',
        success_url: `${domain}/checkout/success?order_id=${newOrder.id}`,
        cancel_url: `${domain}/checkout/cancel?order_id=${newOrder.id}`,
        test: isTestMode
      };

      const ziinaRes = await fetch('https://api-v2.ziina.com/api/payment_intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(ziinaPayload)
      });

      if (!ziinaRes.ok) {
        console.error('Ziina API Error:', await ziinaRes.text());
        return NextResponse.json({ error: 'Payment gateway error. Please use COD or try again.' }, { status: 500 });
      }

      const ziinaData = await ziinaRes.json();
      
      // Update order with paymentIntentId
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentIntentId: ziinaData.id }
      });
      
      if (paymentMethod !== 'online') {
        const itemDetails = items.map((i: any) => `${i.quantity}x ${i.name}`).join('\n');
        const message = `🔔 <b>New COD Order!</b>
        
👤 <b>Name:</b> ${name}
📞 <b>Phone:</b> ${phone}
📍 <b>Address:</b> ${address}
💰 <b>Total:</b> ${total} AED
🛒 <b>Items:</b>
${itemDetails}`;
        
        await sendTelegramNotification(message);
      }
      
      return NextResponse.json({ ...newOrder, redirect_url: ziinaData.redirect_url }, { status: 201 });
    }
    
    // COD notification
    const itemDetails = items.map((i: any) => `${i.quantity}x ${i.name}`).join('\n');
    const message = `🔔 <b>New COD Order!</b>
    
👤 <b>Name:</b> ${name}
📞 <b>Phone:</b> ${phone}
📍 <b>Address:</b> ${address}
💰 <b>Total:</b> ${total} AED
🛒 <b>Items:</b>
${itemDetails}`;
    
    await sendTelegramNotification(message);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
