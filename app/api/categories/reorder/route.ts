import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { items } = body; // expecting array of { id, order }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    // Execute bulk update using transactions
    const queries = items.map((item: any) => 
      prisma.category.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );

    await prisma.$transaction(queries);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder categories" }, { status: 500 });
  }
}
