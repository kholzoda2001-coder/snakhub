'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ShopShell from '../../components/ShopShell';
import { useCart } from '../../context/CartContext';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsData(data);
        } else {
          import('../../data/products').then(mod => setProductsData(mod.products));
        }
      })
      .catch(() => {
        import('../../data/products').then(mod => setProductsData(mod.products));
      })
      .finally(() => setLoading(false));
  }, []);

  const wishlistProducts = productsData.filter(p => wishlist.has(p.id));

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Back</Link>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '24px' }}>
            My Wishlist ❤️
          </h1>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : wishlistProducts.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>🤍</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Your wishlist is empty</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Save items you love here to easily find them later.</p>
              <Link href="/" style={{ 
                background: 'var(--orange)', color: '#fff', padding: '12px 24px', 
                borderRadius: '50px', fontWeight: 800, textDecoration: 'none' 
              }}>
                Start Browsing
              </Link>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
              gap: '16px' 
            }}>
              {wishlistProducts.map((p: any, i: number) => {
                return (
                  <div key={p.id} className="product-card" style={{ margin: 0, width: '100%' }}>
                    <Link href={`/product/${p.id}`} className="prod-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <div className="prod-img-wrap">
                        {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                        <img src={p.img} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </Link>
                    <button className="wl-btn on" onClick={() => toggleWishlist(p.id)} style={{ zIndex: 10 }}>
                      ❤️
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
