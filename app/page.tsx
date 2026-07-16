import React from 'react';
import ShopShell from '../components/ShopShell';
import Footer from '../components/Footer';
import HomeContent from '../components/HomeContent';
import { getActiveBanners, getShopCategories, getShopProducts } from '../lib/catalog';

// Rendered on the server so the browser gets finished HTML instead of firing
// six API calls after hydration. The database sits far from the Vercel region,
// so the result is cached and refreshed at most once a minute — admin edits
// show up within that window.
export const revalidate = 60;

function groupByCategory(products: any[], categories: any[]) {
  const byCat: Record<string, any[]> = {};
  for (const product of products) {
    (byCat[product.cat] ||= []).push(product);
  }

  const groups: { slug: string; label: string; products: any[] }[] = [];

  // Categories the admin has ordered come first, in that order.
  for (const category of categories) {
    if (byCat[category.slug]) {
      groups.push({ slug: category.slug, label: category.name, products: byCat[category.slug] });
      delete byCat[category.slug];
    }
  }

  // Anything left over still gets a row.
  for (const [slug, catProducts] of Object.entries(byCat)) {
    if (catProducts.length > 0) {
      groups.push({ slug, label: catProducts[0].catLabel || slug, products: catProducts });
    }
  }

  return groups;
}

export default async function Home() {
  const [products, categories, banners] = await Promise.all([
    getShopProducts(),
    getShopCategories(),
    getActiveBanners(),
  ]);

  return (
    <>
      <ShopShell />
      <HomeContent
        banners={banners}
        categories={categories}
        categoryGroups={groupByCategory(products, categories)}
      />
      <Footer />
    </>
  );
}
