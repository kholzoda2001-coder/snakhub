import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getShopProducts } from '../../../lib/catalog';
import { resolveThumbnails } from '../../../lib/productImages';
import { requireAdmin } from '../../../lib/adminGuard';

export const revalidate = 10; // Cache at edge for 10 seconds

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Raw image data is only for the admin form. proxy.ts requires a session
    // for this, so reaching it without one is not possible.
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      // The admin view carries cost prices — the shop's margin on every line.
      const denied = await requireAdmin();
      if (denied) return denied;

      // `raw=1` is only for the edit form, which needs the real image data to
      // save it back. The list must never pull the blobs: 12 products came to
      // 657 KB, 99% of it base64 rendered into 40px thumbnails.
      if (searchParams.get('raw') === '1') {
        const id = Number(searchParams.get('id'));
        if (!Number.isFinite(id)) {
          return NextResponse.json({ error: 'raw=1 requires an id' }, { status: 400 });
        }
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(product);
      }

      const products = await prisma.product.findMany({
        select: {
          id: true, name: true, cat: true, catLabel: true, price: true, oldPrice: true,
          cost: true, stock: true, tag: true, tagLabel: true, isOfferEligible: true, desc: true,
          viewers: true, createdAt: true,
        },
        orderBy: { id: 'desc' },
      });

      // Base64 rows are shown through /api/images, which is cached for a year.
      const thumbnails = await resolveThumbnails(products.map((p) => p.id));
      return NextResponse.json(
        products.map((p) => ({ ...p, img: thumbnails.get(p.id), images: [] as string[] }))
      );
    }

    // Identical for every shopper — no cookie is read on this path, so a shared
    // cache is safe. A minute fresh, then served stale for five more while it
    // refreshes in the background, so a burst of traffic never queues on the
    // database.
    return NextResponse.json(await getShopProducts(), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const newProduct = await prisma.product.create({ data: body });
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
