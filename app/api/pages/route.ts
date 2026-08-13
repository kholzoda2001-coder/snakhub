import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

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
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const page = await prisma.page.create({
      data: body
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
