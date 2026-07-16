import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { publicImageSrc } from '../../../../lib/productImages';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) }
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // External URLs go straight to the browser; base64 is served by /api/images.
    const gallery = Array.isArray(product.images) ? (product.images as string[]) : [];
    const formatted = {
      ...product,
      img: publicImageSrc(product.id, product.img),
      images: gallery.length > 0
        ? gallery.map((stored, i) => publicImageSrc(product.id, stored, i))
        : [publicImageSrc(product.id, product.img)]
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
