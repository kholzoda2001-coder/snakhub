import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { buildOrderMessage, sendTelegramNotification } from '../../../../lib/telegram';
import { isStockTrackingOn, type OrderItem } from '../../../../lib/orders';
import { checkUaeMobile, toE164, toLocalDigits } from '../../../../lib/phone';
import { requireAdmin } from '../../../../lib/adminGuard';

export const dynamic = 'force-dynamic';

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Manual sales entry for orders taken over WhatsApp/phone. Unlike the public
 * checkout, the staff member types in the agreed price and cost per line
 * themselves — nothing here is trusted from a browser, so there is no need to
 * re-derive them from the catalogue.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { name, phone, address, items, deliveryFee } = body;

    const customerName = String(name ?? '').trim();
    const streetAddress = String(address ?? '').trim();
    if (!customerName || !streetAddress) {
      return NextResponse.json({ error: 'Name and address are required.' }, { status: 400 });
    }

    const localDigits = toLocalDigits(String(phone ?? ''));
    const phoneCheck = checkUaeMobile(localDigits);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: phoneCheck.message || 'Please enter a valid UAE mobile number.' },
        { status: 400 }
      );
    }
    const normalisedPhone = toE164(localDigits);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Add at least one item.' }, { status: 400 });
    }

    // Merge duplicate lines and reject anything that isn't a real line.
    const lines = new Map<number, { qty: number; price: number; cost: number }>();
    for (const item of items) {
      const id = Number(item?.id);
      const qty = Math.floor(Number(item?.qty));
      const price = Number(item?.price);
      const cost = Number(item?.cost);
      if (
        !Number.isInteger(id) ||
        !Number.isFinite(qty) || qty < 1 || qty > 999 ||
        !Number.isFinite(price) || price < 0 ||
        !Number.isFinite(cost) || cost < 0
      ) {
        return NextResponse.json({ error: 'One of the items has an invalid quantity, price or cost.' }, { status: 400 });
      }
      const existing = lines.get(id);
      if (existing) existing.qty += qty;
      else lines.set(id, { qty, price, cost });
    }

    // Name, category label and offer flag still come from the database — only
    // price and cost are the staff member's to override.
    const products = await prisma.product.findMany({
      where: { id: { in: [...lines.keys()] } },
      select: { id: true, name: true, stock: true, catLabel: true, isOfferEligible: true },
    });
    if (products.length !== lines.size) {
      return NextResponse.json({ error: 'Some products in this order no longer exist. Refresh and try again.' }, { status: 400 });
    }

    const orderItems: OrderItem[] = products.map((product) => {
      const line = lines.get(product.id)!;
      return {
        id: product.id,
        name: product.name,
        price: round(line.price),
        cost: round(line.cost),
        qty: line.qty,
        catLabel: product.catLabel,
        isOfferEligible: product.isOfferEligible,
      };
    });

    const trackStock = await isStockTrackingOn();
    if (trackStock) {
      const short = orderItems.filter((item) => {
        const product = products.find((p) => p.id === item.id)!;
        return product.stock < item.qty;
      });
      if (short.length > 0) {
        return NextResponse.json(
          { error: `Out of stock: ${short.map((i) => i.name).join(', ')}` },
          { status: 409 }
        );
      }
    }

    const fee = Number.isFinite(Number(deliveryFee)) ? Math.max(0, Number(deliveryFee)) : 0;
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = round(subtotal + fee);

    const newOrder = await prisma.$transaction(async (tx) => {
      if (trackStock) {
        for (const item of orderItems) {
          const reserved = await tx.product.updateMany({
            where: { id: item.id, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (reserved.count === 0) throw new Error(`OUT_OF_STOCK:${item.name}`);
        }
      }

      return tx.order.create({
        data: {
          name: customerName,
          phone: normalisedPhone,
          address: streetAddress,
          items: orderItems,
          total,
          status: 'Pending',
        },
      });
    });

    await sendTelegramNotification(buildOrderMessage('📱 <b>New POS Order (WhatsApp)</b>', newOrder));

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('OUT_OF_STOCK:')) {
      return NextResponse.json({ error: `Out of stock: ${message.split(':')[1]}` }, { status: 409 });
    }
    console.error('Error creating POS order:', error);
    return NextResponse.json({ error: 'Failed to save the order.' }, { status: 500 });
  }
}
