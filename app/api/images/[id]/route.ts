import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(req.url);
    const index = parseInt(searchParams.get('index') || '0');

    const id = parseInt(params.id);
    if (isNaN(id) || isNaN(index) || index < 0) return new NextResponse('Not found', { status: 404 });

    // Only the column actually needed is read — these are LongText blobs.
    const product = await prisma.product.findUnique({
      where: { id },
      select: index === 0 ? { img: true } : { images: true }
    });

    if (!product) return new NextResponse('Not found', { status: 404 });

    let base64String = '';
    if (index === 0) {
      base64String = (product as { img: string }).img;
    } else {
      const images = (product as { images: unknown }).images as string[];
      if (Array.isArray(images) && images.length > index) {
        base64String = images[index];
      } else {
        return new NextResponse('Not found', { status: 404 });
      }
    }

    if (!base64String) return new NextResponse('Not found', { status: 404 });

    // Handle normal URLs (if old products still use ImgBB links)
    if (base64String.startsWith('http')) {
      return NextResponse.redirect(base64String);
    }

    // Convert Base64 to Buffer
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse('Invalid image data', { status: 500 });
    }

    const type = matches[1];
    const data = Buffer.from(matches[2], 'base64');

    return new NextResponse(data, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
}
