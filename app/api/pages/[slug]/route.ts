import { NextResponse } from 'next/server';
import { isDuplicateKeyError, prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/adminGuard';

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
    });
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const params = await context.params;
    const body = await req.json();
    const slug = String(body.slug ?? '').trim().toLowerCase().replace(/\s+/g, '-');
    const title = String(body.title ?? '').trim();
    if (!slug || !title) {
      return NextResponse.json({ error: 'A slug and a title are both required.' }, { status: 400 });
    }

    const updatedPage = await prisma.page.update({
      where: { slug: params.slug },
      data: { slug, title, content: String(body.content ?? '') },
    });
    return NextResponse.json(updatedPage);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Another page already uses that slug. Pick a different one.' },
        { status: 409 }
      );
    }
    console.error('Failed to update page:', error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const params = await context.params;
    await prisma.page.delete({
      where: { slug: params.slug },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
