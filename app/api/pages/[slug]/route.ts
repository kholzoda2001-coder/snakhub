import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
    });
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const body = await req.json();
    const updatedPage = await prisma.page.update({
      where: { slug: params.slug },
      data: body,
    });
    return NextResponse.json(updatedPage);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    await prisma.page.delete({
      where: { slug: params.slug },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
