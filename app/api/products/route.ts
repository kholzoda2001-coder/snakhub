import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const revalidate = 10; // Cache at edge for 10 seconds

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        cat: true,
        catLabel: true,
        price: true,
        oldPrice: true,
        tag: true,
        tagLabel: true,
        isOfferEligible: true,
        stock: true,
        desc: true,
        img: isAdmin ? true : false,
        images: isAdmin ? true : false,
      }
    });

    const formatted = products.map((p: any) => {
      if (isAdmin) return p;
      return {
        ...p,
        img: `/api/images/${p.id}?index=0`,
        images: []
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProduct = await prisma.product.create({ data: body });
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
