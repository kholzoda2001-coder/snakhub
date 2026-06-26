import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) }
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    // Convert base64 fields to API URLs
    const formatted = {
      ...product,
      img: `/api/images/${product.id}?index=0`,
      images: Array.isArray(product.images) && product.images.length > 0 
        ? product.images.map((_: any, i: number) => `/api/images/${product.id}?index=${i}`)
        : [`/api/images/${product.id}?index=0`]
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await req.json();
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: body
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.product.delete({
      where: { id: parseInt(params.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
