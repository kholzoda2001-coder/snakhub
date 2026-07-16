import { prisma } from './prisma';
import { resolveThumbnails } from './productImages';

/**
 * The shop's product list, with image sources already resolved. Shared by
 * /api/products and the server-rendered pages so both return the same shape.
 */
export async function getShopProducts() {
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

  const thumbnails = await resolveThumbnails(products.map((p) => p.id));
  return products.map((product) => ({
    ...product,
    img: thumbnails.get(product.id),
    images: [] as string[],
  }));
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
