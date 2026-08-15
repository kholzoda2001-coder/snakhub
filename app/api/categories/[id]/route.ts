import { NextResponse } from 'next/server';
import { isDuplicateKeyError, prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/adminGuard';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const slug = String(body.slug ?? '').trim().toLowerCase();
    const name = String(body.name ?? '').trim();
    if (!slug || !name) {
      return NextResponse.json({ error: 'A slug and a name are both required.' }, { status: 400 });
    }

    const estimate = String(body.deliveryEstimate ?? '').trim();
    // Named fields only — the request body is not handed to Prisma wholesale.
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        slug,
        name,
        icon: body.icon ? String(body.icon) : null,
        img: body.img ? String(body.img) : null,
        cardOnly: Boolean(body.cardOnly),
        deliveryEstimate: estimate || null,
      },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Another category already uses that slug. Pick a different one.' },
        { status: 409 }
      );
    }
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const params = await context.params;
    const id = parseInt(params.id);
    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
