import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Uploads an image to ImgBB. The key stays on the server — it used to be a
 * NEXT_PUBLIC_ variable, which shipped it to every visitor's browser.
 * Admin-only: proxy.ts requires a session for this route.
 */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Image uploads are not configured. Set IMGBB_API_KEY on the server.' },
        { status: 500 }
      );
    }

    const incoming = await req.formData();
    const file = incoming.get('image');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image is larger than 8MB.' }, { status: 413 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'That file is not an image.' }, { status: 400 });
    }

    const outgoing = new FormData();
    outgoing.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: outgoing,
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      console.error('ImgBB upload failed:', data?.error);
      return NextResponse.json({ error: data?.error?.message || 'Upload failed' }, { status: 502 });
    }

    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
