import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getShopProducts } from '../../../lib/catalog';

export const revalidate = 10; // Cache at edge for 10 seconds

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Raw image data is only for the admin form. proxy.ts requires a session
    // for this, so reaching it without one is not possible.
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      const products = await prisma.product.findMany();
      return NextResponse.json(products);
    }

    return NextResponse.json(await getShopProducts());
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProduct = await prisma.product.create({ data: body });
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
