import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { buildOrderMessage, sendTelegramNotification } from '../../../lib/telegram';
import { calculateTotals } from '../../../lib/pricing';
import { isStockTrackingOn, markOrderFailed, type OrderItem } from '../../../lib/orders';
import { createPaymentIntent, getZiinaConfig } from '../../../lib/ziina';
import { checkUaeMobile, toE164, toLocalDigits } from '../../../lib/phone';
import { cardOnlyItems, toRules } from '../../../lib/categoryRules';
import { getCurrentCompanyId } from '../../../lib/companyAuth';
import { getCompanyPriceOverrides } from '../../../lib/companyPricing';
import { WHOLESALE_HIDDEN_CATEGORIES } from '../../../lib/wholesaleCategories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { name: true, phone: true } } }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
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

    // The form validates too, but that is bypassable — an unreachable phone
    // number means an order nobody can deliver.
    const localDigits = toLocalDigits(customerPhone);
    const phoneCheck = checkUaeMobile(localDigits);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: phoneCheck.message || 'Please enter a valid UAE mobile number.' },
        { status: 400 }
      );
    }
    const normalisedPhone = toE164(localDigits);

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
      select: { id: true, name: true, price: true, cost: true, stock: true, cat: true, catLabel: true, isOfferEligible: true }
    });

    if (products.length !== requestedQty.size) {
      return NextResponse.json({ error: 'Some products are no longer available. Please refresh your cart.' }, { status: 400 });
    }

    // A logged-in wholesale company gets its own negotiated price per product,
    // resolved here from the session cookie — never trusted from the request body.
    const companyId = await getCurrentCompanyId();

    // Some categories (imported rarities) are retail-only. The storefront
    // already hides them from a logged-in company, but a hand-made request
    // must be rejected too.
    if (companyId) {
      const blockedItems = products.filter((p) => WHOLESALE_HIDDEN_CATEGORIES.includes(p.cat));
      if (blockedItems.length > 0) {
        return NextResponse.json(
          { error: `Not available for wholesale orders: ${blockedItems.map((p) => p.name).join(', ')}` },
          { status: 400 }
        );
      }
    }

    const priceOverrides = companyId
      ? await getCompanyPriceOverrides(companyId, products.map((p) => p.id))
      : null;

    const orderItems: OrderItem[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: priceOverrides?.get(product.id) ?? product.price,
      // Cost is snapshotted with the sale so last month's margin does not change
      // when a supplier price changes today.
      cost: product.cost,
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
    // Wholesale orders are invoice-style — no online payment, confirmed manually
    // by the admin — regardless of what the request claims.
    const isOnline = paymentMethod === 'online' && !companyId;

    // The checkout form hides cash on delivery for these, but the form is not a
    // security boundary — a hand-made request must not put a 600 AED import on
    // a driver's cash round. Wholesale orders skip this: there is no online
    // payment option for them to fall back to, and the admin reviews every
    // order before it ships anyway.
    if (!isOnline && !companyId) {
      const rules = toRules(
        await prisma.category.findMany({ select: { slug: true, cardOnly: true, deliveryEstimate: true } })
      );
      const blocked = cardOnlyItems(
        products.map((p) => ({ name: p.name, cat: p.cat })),
        rules
      );
      if (blocked.length > 0) {
        return NextResponse.json(
          {
            error: `Card payment is required for: ${blocked.map((b) => b.name).join(', ')}. `
              + `Remove these to pay cash on delivery.`,
          },
          { status: 400 }
        );
      }
    }

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
          phone: normalisedPhone,
          address: fullAddress,
          items: orderItems,
          total: totals.finalTotal,
          status: isOnline ? 'Pending Payment' : 'Pending',
          companyId: companyId ?? null
        }
      });
    });

    if (isOnline) {
      // The order row and its stock reservation already exist by this point, so
      // every exit below has to release them. Without this an unreachable
      // payment gateway silently ate stock and left an order stuck on
      // "Pending Payment" that nothing would ever resolve.
      const abandonOrder = async () => {
        await markOrderFailed({ ...newOrder, items: orderItems });
      };

      const { apiKey, isTestMode, isEnabled } = await getZiinaConfig();

      if (!apiKey || !isEnabled) {
        await abandonOrder();
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
        await abandonOrder();
        return NextResponse.json({ error: 'Payment gateway error. Please use COD or try again.' }, { status: 502 });
      }

      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentIntentId: intent.id }
      });

      // The shop is notified once the payment actually clears, not now.
      return NextResponse.json({ ...newOrder, redirect_url: intent.redirect_url }, { status: 201 });
    }

    await sendTelegramNotification(
      buildOrderMessage(companyId ? '🏢 <b>New Wholesale Order!</b>' : '🔔 <b>New COD Order!</b>', newOrder)
    );

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('OUT_OF_STOCK:')) {
      return NextResponse.json({ error: `Out of stock: ${message.split(':')[1]}` }, { status: 409 });
    }
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
