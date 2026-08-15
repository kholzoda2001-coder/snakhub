import { prisma } from './prisma';

/** Maps productId -> this company's negotiated price. Products without a row here use retail price. */
export async function getCompanyPriceOverrides(companyId: number, productIds: number[]) {
  if (productIds.length === 0) return new Map<number, number>();
  const rows = await prisma.companyPrice.findMany({
    where: { companyId, productId: { in: productIds } },
    select: { productId: true, price: true },
  });
  return new Map(rows.map((row) => [row.productId, row.price]));
}
