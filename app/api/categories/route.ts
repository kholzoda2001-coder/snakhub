import { NextResponse } from 'next/server';
import { isDuplicateKeyError, prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Builds the row from named fields rather than passing the request body to
 * Prisma wholesale: an unexpected key used to make the whole write fail with an
 * opaque 500, and a `createdAt` or `id` in the body would have been honoured.
 */
function categoryData(body: Record<string, unknown>) {
  const slug = String(body.slug ?? '').trim().toLowerCase();
  const name = String(body.name ?? '').trim();
  const estimate = String(body.deliveryEstimate ?? '').trim();

  return {
    valid: Boolean(slug) && Boolean(name),
    data: {
      slug,
      name,
      icon: body.icon ? String(body.icon) : null,
      img: body.img ? String(body.img) : null,
      cardOnly: Boolean(body.cardOnly),
      deliveryEstimate: estimate || null,
    },
  };
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { valid, data } = categoryData(await req.json());
    if (!valid) {
      return NextResponse.json({ error: 'A slug and a name are both required.' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({ data });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'A category with that slug already exists. Pick a different slug.' },
        { status: 409 }
      );
    }
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
