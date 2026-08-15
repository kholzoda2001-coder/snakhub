import React from 'react';
import ShopShell from '../components/ShopShell';
import Footer from '../components/Footer';
import HomeContent from '../components/HomeContent';
import HomeFaq from '../components/HomeFaq';
import Hero from '../components/Hero';
import { getActiveBanners, getShopCategories, getShopProducts } from '../lib/catalog';
import type { ShopCategory, ShopProduct } from '../lib/types';

// Rendered on the server so the browser gets finished HTML instead of firing
// six API calls after hydration. The database sits far from the Vercel region,
// so the result is cached and refreshed at most once a minute — admin edits
// show up within that window.
export const revalidate = 60;

function groupByCategory(products: ShopProduct[], categories: ShopCategory[]) {
  const byCat: Record<string, ShopProduct[]> = {};
  for (const product of products) {
    (byCat[product.cat] ||= []).push(product);
  }

  const groups: { slug: string; label: string; products: ShopProduct[] }[] = [];

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

/**
 * Shown when the catalog cannot be read. The database sits on a remote host, so
 * a dropped connection is a question of when, not if — and a shopper should get
 * a working page with an explanation rather than a crashed one.
 */
function CatalogUnavailable() {
  return (
    <div style={{
      minHeight: '46vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '12px',
      padding: '48px 24px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '42px', lineHeight: 1 }}>🛒</div>
      <h2 style={{
        fontFamily: 'var(--font-d)', fontSize: '26px', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '.02em', color: 'var(--text-primary)'
      }}>
        Products are taking a break
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
        We could not reach our catalog just now. Give it a moment and refresh — your cart is safe.
      </p>
      {/* A full document load is the point here — this is the "try the server
          again" button, so a client-side route change would change nothing. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="show-more-btn" style={{ textDecoration: 'none', marginTop: '4px' }}>Refresh</a>
    </div>
  );
}

export default async function Home() {
  let products: Awaited<ReturnType<typeof getShopProducts>>;
  let categories: Awaited<ReturnType<typeof getShopCategories>>;
  let banners: Awaited<ReturnType<typeof getActiveBanners>>;

  try {
    [products, categories, banners] = await Promise.all([
      getShopProducts(),
      getShopCategories(),
      getActiveBanners(),
    ]);
  } catch (error) {
    // A catalog read failure must not take the header, menu and cart with it.
    console.error('Storefront catalog load failed:', error);
    return (
      <>
        <ShopShell />
        <CatalogUnavailable />
        <Footer />
      </>
    );
  }

  return (
    <>
      <ShopShell />
      {/* Admin → Banners had a full editor, an API and a database table, but
          nothing ever rendered them. With none configured this shows nothing,
          so the page looks exactly as it does today until a banner is added. */}
      <Hero banners={banners} />
      <HomeContent
        categories={categories}
        categoryGroups={groupByCategory(products, categories)}
      />
      <HomeFaq />
      <Footer />
    </>
  );
}
