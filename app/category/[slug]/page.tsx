'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ShopShell from '../../../components/ShopShell';
import { useCart } from '../../../context/CartContext';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  // Unwrap params using React.use() if needed in Next 15, or just await it if it's async.
  // Actually in Next 15 client components, params is a promise.
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    // Handling Next.js 15 async params in client component
    async function resolveParams() {
      const resolved = await params;
      setSlug(resolved.slug);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsData(data.filter((p: any) => p.cat === slug));
        } else {
          import('../../../data/products').then(mod => {
            setProductsData(mod.products.filter((p: any) => p.cat === slug));
          });
        }
      })
      .catch(() => {
        import('../../../data/products').then(mod => {
          setProductsData(mod.products.filter((p: any) => p.cat === slug));
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const catLabel = productsData.length > 0 ? productsData[0].catLabel : slug.toUpperCase();

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Back</Link>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '24px', textTransform: 'capitalize' }}>
            {catLabel}
          </h1>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : productsData.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No products found in this category.</div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '20px' 
            }}>
              {productsData.map((p: any, i: number) => {
                const inWL = wishlist.has(p.id);
                return (
                  <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.05}s`, margin: 0, width: '100%' }}>
                    <Link href={`/product/${p.id}`} className="prod-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <div className="prod-img-wrap">
                        {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                        <img src={p.img} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                        <div className="prod-price">{p.price} AED</div>
                        {p.oldPrice && <div className="prod-old">{p.oldPrice} AED</div>}
                      </div>
                      <div className="prod-stock">✅ In stock</div>
                      <button className="atc-btn" onClick={() => addToCart(p)}>
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
