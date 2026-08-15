import { NextResponse } from 'next/server';
import { isDuplicateKeyError, prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/adminGuard';

export async function GET(req: Request) {
  try {
    // The footer runs on every page view but only needs link names. Sending the
    // whole body as well meant shipping the entire privacy policy each time.
    const navOnly = new URL(req.url).searchParams.get('nav') === '1';

    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
      ...(navOnly ? { select: { id: true, slug: true, title: true } } : {}),
    });

    return NextResponse.json(pages, {
      headers: navOnly
        // Footer links change about never; the admin editor still gets fresh data.
        ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' }
        : { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    // A slug becomes a public URL, so it is normalised rather than taken as
    // typed — "About Us " and "about-us" must not be two different pages.
    const slug = String(body.slug ?? '').trim().toLowerCase().replace(/\s+/g, '-');
    const title = String(body.title ?? '').trim();
    if (!slug || !title) {
      return NextResponse.json({ error: 'A slug and a title are both required.' }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: { slug, title, content: String(body.content ?? '') }
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'A page with that slug already exists. Edit it instead, or pick a different slug.' },
        { status: 409 }
      );
    }
    console.error('Failed to create page:', error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
