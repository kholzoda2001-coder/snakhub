import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentCompanyId } from '../../../../lib/companyAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const companyId = await getCurrentCompanyId();
  if (!companyId) {
    return NextResponse.json({ company: null, prices: {} });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true },
  });
  if (!company) {
    return NextResponse.json({ company: null, prices: {} });
  }

  const rows = await prisma.companyPrice.findMany({
    where: { companyId },
    select: { productId: true, price: true },
  });
  const prices: Record<number, number> = {};
  for (const row of rows) prices[row.productId] = row.price;

  return NextResponse.json({ company, prices });
}
