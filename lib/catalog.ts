import { prisma } from './prisma';
import { resolveThumbnails } from './productImages';
import { isStockTrackingOn } from './orders';
import { stockInfo } from './stock';
import { getCompanyPriceOverrides } from './companyPricing';
import { sanitizeInlineHtml } from './sanitizeHtml';

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
      // `desc` is deliberately not selected. No card, grid or detail view renders
      // it, but it is the longest column on the table — sending it meant every
      // shopper downloaded a paragraph per product to display none of them. Add
      // it back here the moment something actually shows a description.
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
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  // Hero renders `title` through dangerouslySetInnerHTML. It is a client
  // component, so cleaning the value here keeps the sanitiser out of the browser
  // bundle — and this is the only path that reaches the shopper, since Hero
  // takes its banners as a prop rather than fetching them.
  return banners.map((banner) => ({
    ...banner,
    title: sanitizeInlineHtml(banner.title),
  }));
}
