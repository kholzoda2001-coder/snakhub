import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { buildOrderMessage, sendTelegramNotification } from '../../../lib/telegram';
import { calculateTotals } from '../../../lib/pricing';
import { isStockTrackingOn, type OrderItem } from '../../../lib/orders';
import { createPaymentIntent, getZiinaConfig } from '../../../lib/ziina';

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
    const { name, phone, city, address, items, paymentMethod } = body;

    const customerName = String(name ?? '').trim();
    const customerPhone = String(phone ?? '').trim();
    const streetAddress = String(address ?? '').trim();
    const customerCity = String(city ?? '').trim();

    if (!customerName || !customerPhone || !streetAddress) {
      return NextResponse.json({ error: 'Name, phone and address are required.' }, { status: 400 });
    }

    // The emirate is picked in a separate field but the courier needs it on one line.
    const fullAddress = customerCity ? `${streetAddress}, ${customerCity}` : streetAddress;

    // Merge duplicate lines and reject anything that isn't a real quantity.
    const requestedQty = new Map<number, number>();
    for (const item of Array.isArray(items) ? items : []) {
      const id = Number(item?.id);
      const qty = Math.floor(Number(item?.qty ?? item?.quantity));
      if (!Number.isInteger(id) || !Number.isFinite(qty) || qty < 1 || qty > 999) {
        return NextResponse.json({ error: 'Your cart contains an invalid item.' }, { status: 400 });
      }
      requestedQty.set(id, (requestedQty.get(id) ?? 0) + qty);
    }

    if (requestedQty.size === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // Prices, names and offer flags come from the database — never from the browser.
    const products = await prisma.product.findMany({
      where: { id: { in: [...requestedQty.keys()] } },
      select: { id: true, name: true, price: true, stock: true, catLabel: true, isOfferEligible: true }
    });

    if (products.length !== requestedQty.size) {
      return NextResponse.json({ error: 'Some products are no longer available. Please refresh your cart.' }, { status: 400 });
    }

    const orderItems: OrderItem[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: requestedQty.get(product.id)!,
      catLabel: product.catLabel,
      isOfferEligible: product.isOfferEligible
    }));

    const trackStock = await isStockTrackingOn();
    if (trackStock) {
      const shortItems = orderItems.filter((item) => {
        const product = products.find((p) => p.id === item.id)!;
        return product.stock < item.qty;
      });
      if (shortItems.length > 0) {
        return NextResponse.json(
          { error: `Out of stock: ${shortItems.map((i) => i.name).join(', ')}` },
          { status: 409 }
        );
      }
    }

    const totals = calculateTotals(orderItems);
    const isOnline = paymentMethod === 'online';

    // Reserving stock and creating the order must succeed or fail together.
    const newOrder = await prisma.$transaction(async (tx) => {
      if (trackStock) {
        for (const item of orderItems) {
          // The stock condition lives in the WHERE clause so two shoppers
          // checking out at once can't oversell the last unit.
          const reserved = await tx.product.updateMany({
            where: { id: item.id, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } }
          });
          if (reserved.count === 0) throw new Error(`OUT_OF_STOCK:${item.name}`);
        }
      }

      return tx.order.create({
        data: {
          name: customerName,
          phone: customerPhone,
          address: fullAddress,
          items: orderItems,
          total: totals.finalTotal,
          status: isOnline ? 'Pending Payment' : 'Pending'
        }
      });
    });

    if (isOnline) {
      const { apiKey, isTestMode, isEnabled } = await getZiinaConfig();

      if (!apiKey || !isEnabled) {
        return NextResponse.json({ error: 'Online payment is currently unavailable. Please use COD.' }, { status: 400 });
      }

      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host') || 'localhost:3000';
      const domain = `${protocol}://${host}`;

      const intent = await createPaymentIntent({
        amount: Math.round(totals.finalTotal * 100), // fils
        currency_code: 'AED',
        success_url: `${domain}/checkout/success?order_id=${newOrder.id}`,
        cancel_url: `${domain}/checkout/cancel?order_id=${newOrder.id}`,
        test: isTestMode
      }, apiKey);

      if (!intent?.id) {
        return NextResponse.json({ error: 'Payment gateway error. Please use COD or try again.' }, { status: 502 });
      }

      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentIntentId: intent.id }
      });

      // The shop is notified once the payment actually clears, not now.
      return NextResponse.json({ ...newOrder, redirect_url: intent.redirect_url }, { status: 201 });
    }

    await sendTelegramNotification(buildOrderMessage('🔔 <b>New COD Order!</b>', newOrder));

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.startsWith('OUT_OF_STOCK:')) {
      return NextResponse.json({ error: `Out of stock: ${error.message.split(':')[1]}` }, { status: 409 });
    }
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
