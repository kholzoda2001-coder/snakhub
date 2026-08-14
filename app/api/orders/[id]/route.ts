import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/** Delivery states the admin may set. */
const FULFILLMENT_STATES = ['Unfulfilled', 'Processing', 'Fulfilled', 'Cancelled'];

/**
 * Full order including the customer's name, phone and address.
 *
 * Admin only — proxy.ts uses a default-deny allowlist and this path is not on
 * it, so an unauthenticated request gets 401 before reaching here. The public
 * route for shoppers is /api/orders/[id]/verify, which returns payment state
 * only.
 */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await req.json();

    // Only `fulfillment` and the recovery flag are settable here. `status`
    // holds the payment state and is owned by the checkout and Ziina flows —
    // letting the admin write it is what used to erase "Paid" the moment an
    // order was marked shipped.
    const data: { fulfillment?: string; contactedAt?: Date | null } = {};

    if (body.fulfillment !== undefined) {
      if (!FULFILLMENT_STATES.includes(body.fulfillment)) {
        return NextResponse.json(
          { error: `fulfillment must be one of: ${FULFILLMENT_STATES.join(', ')}` },
          { status: 400 }
        );
      }
      data.fulfillment = body.fulfillment;
    }

    if (body.contacted !== undefined) {
      data.contactedAt = body.contacted ? new Date() : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(params.id) },
      data,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
