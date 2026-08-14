'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ShopShell from '../../../components/ShopShell';
import Footer from '../../../components/Footer';
import { useCart } from '../../../context/CartContext';
import { canOptimize } from '../../../lib/imageHosts';
import { stockLabel } from '../../../lib/stock';
import Loader from '../../../components/Loader';
import { useLanguage } from '../../../context/LanguageContext';
import { localiseEstimate } from '../../../lib/delivery';
import type { CategoryRule } from '../../../lib/categoryRules';
import { applyWholesalePricing, filterWholesaleCategories, useWholesale } from '../../../context/WholesaleContext';
import { formatMoney, showsOldPrice } from '../../../lib/pricing';
import type { ShopCategory, ShopProduct } from '../../../lib/types';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [productsData, setProductsData] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [rule, setRule] = useState<CategoryRule | null>(null);
  // The category's own name, so the heading reads "Monster Energy" even before
  // any product has loaded — and stays right for a category with nothing in it.
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { t, locale } = useLanguage();
  const { company, prices } = useWholesale();
  const pricedProducts = applyWholesalePricing(filterWholesaleCategories(productsData, company), prices);
  // In Next 16 `params` reaches a client component as a promise; React.use()
  // unwraps it during render instead of a state round-trip.
  const { slug } = React.use(params);

  useEffect(() => {
    if (!slug) return;
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductsData((data as ShopProduct[]).filter((p) => p.cat === slug));
        }
      })
      .catch(() => {
        setProductsData([]);
      })
      .finally(() => {
        setLoading(false);
      });

    // Payment and shipping rules live on the category, not the product.
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const match = Array.isArray(data) ? (data as ShopCategory[]).find((c) => c.slug === slug) : null;
        if (match) {
          setCategoryName(match.name);
          setRule({ cardOnly: Boolean(match.cardOnly), deliveryEstimate: match.deliveryEstimate });
        } else if (Array.isArray(data)) {
          // A slug nobody sells is a real 404, not an empty shelf — otherwise
          // every mistyped URL is a 200 for search engines to index.
          notFound();
        }
      })
      .catch(() => {});
  }, [slug]);

  const catLabel = categoryName || (productsData.length > 0 ? productsData[0].catLabel : slug.toUpperCase());

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Back</Link>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: rule?.cardOnly ? '12px' : '24px', textTransform: 'capitalize' }}>
            {catLabel}
          </h1>

          {/* Sits directly under the category name so the payment rule is read
              before anything goes in the cart, not discovered at checkout. */}
          {rule?.cardOnly && (
            <div style={{ background: 'var(--orange-glow)', border: '1.5px solid var(--orange)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '24px', maxWidth: '640px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--price)' }}>
                💳 {t('category.cardOnly')}
              </div>
              {rule.deliveryEstimate && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 600 }}>
                  ✈️ {t('category.cardOnlyShipping', { estimate: localiseEstimate(rule.deliveryEstimate, locale) })}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <Loader />
          ) : pricedProducts.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No products found in this category.</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '16px'
            }}>
              {pricedProducts.map((p, i) => {
                const inWL = wishlist.has(p.id);
                return (
                  <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.05}s`, margin: 0, width: '100%' }}>
                    <Link href={`/product/${p.id}`} className="prod-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <div className="prod-img-wrap">
                        {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                        {p.img && (
                          <Image
                            src={p.img}
                            alt={p.name}
                            fill
                            // Fluid grid: roughly half the viewport on phones,
                            // capped once the columns stop growing.
                            sizes="(min-width:768px) 240px, 45vw"
                            priority={i < 4}
                            unoptimized={!canOptimize(p.img)}
                          />
                        )}
                      </div>
                    </Link>
                    <button className={`wl-btn ${inWL ? 'on' : ''}`} onClick={() => toggleWishlist(p.id)} style={{ zIndex: 10 }}>
                      {inWL ? '❤️' : '🤍'}
                    </button>
                    <div className="prod-info">
                      <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="prod-name">{p.name}</div>
                      </Link>
                      <div className="prod-price-row">
                        <div className="prod-price">{formatMoney(p.price)} {t('product.currency')}</div>
                        {showsOldPrice(p.price, p.oldPrice) && <div className="prod-old">{formatMoney(p.oldPrice)} {t('product.currency')}</div>}
                      </div>
                      <div className={`prod-stock ${stockLabel(p).tone}`}>{t(stockLabel(p).key, stockLabel(p).vars)}</div>
                      {rule?.cardOnly && <div className="prod-cardonly">💳 {t('product.cardOnly')}</div>}
                      <button className="atc-btn" onClick={() => addToCart(p)} disabled={p.soldOut}>
                        {p.soldOut ? t('product.outOfStock') : `🛒 ${t('product.addToCart')}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
