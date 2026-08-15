import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { isAdminAuthenticated } from '../../../../../../lib/auth';

export const dynamic = 'force-dynamic';

/** Body: { overrides: { productId: number, price: number | null }[] }. A null price removes the override (falls back to retail). */
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const companyId = parseInt(id);
  if (isNaN(companyId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const { overrides } = await req.json();
    if (!Array.isArray(overrides)) {
      return NextResponse.json({ error: 'overrides must be an array' }, { status: 400 });
    }

    await prisma.$transaction(
      overrides.map(({ productId, price }: { productId: number; price: number | null }) => {
        const pid = Number(productId);
        if (price === null || price === undefined || Number.isNaN(Number(price))) {
          return prisma.companyPrice.deleteMany({ where: { companyId, productId: pid } });
        }
        return prisma.companyPrice.upsert({
          where: { companyId_productId: { companyId, productId: pid } },
          update: { price: Number(price) },
          create: { companyId, productId: pid, price: Number(price) },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update company prices:', error);
    return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
  }
}
