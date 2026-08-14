import { prisma } from './prisma';
import { resolveThumbnails } from './productImages';
import { isStockTrackingOn } from './orders';
import { stockInfo } from './stock';
import { getCompanyPriceOverrides } from './companyPricing';

/**
 * The shop's product list, with image sources already resolved. Shared by
 * /api/products and the server-rendered pages so both return the same shape.
 *
 * When companyId is set (a wholesaler is logged in), each product's price is
 * swapped for that company's negotiated price where one has been set by the
 * admin — the retail price shows through `oldPrice` instead of being lost.
 */
export async function getShopProducts(companyId?: number | null) {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      cat: true,
      catLabel: true,
      price: true,
      oldPrice: true,
      tag: true,
      tagLabel: true,
      isOfferEligible: true,
      stock: true,
      desc: true,
    }
  });

  // Availability is resolved here rather than in the browser so every surface
  // — home, category, wishlist — gets the same answer without each one having
  // to fetch the shop settings separately.
  const [thumbnails, trackStock, overrides] = await Promise.all([
    resolveThumbnails(products.map((p) => p.id)),
    isStockTrackingOn(),
    companyId ? getCompanyPriceOverrides(companyId, products.map((p) => p.id)) : Promise.resolve(null),
  ]);

  return products.map((product) => {
    const overridePrice = overrides?.get(product.id);
    return {
      ...product,
      ...(overridePrice !== undefined ? { price: overridePrice, oldPrice: product.price } : null),
      img: thumbnails.get(product.id),
      images: [] as string[],
      ...stockInfo(product.stock, trackStock),
    };
  });
}

export async function getShopCategories() {
  return prisma.category.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
}

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });
}
