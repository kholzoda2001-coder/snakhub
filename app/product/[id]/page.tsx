'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopShell from '../../../components/ShopShell';
import { useCart } from '../../../context/CartContext';
import { products } from '../../../data/products'; // fallback data

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const { addToCart, updateQty, wishlist, toggleWishlist } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const allProducts = Array.isArray(data) && data.length > 0 ? data : products;
        
        const found = allProducts.find((p: any) => p.id.toString() === id);
        if (found) {
          setProduct(found);
          // Get related products from same category
          const rel = allProducts.filter((p: any) => p.cat === found.cat && p.id !== found.id).slice(0, 4);
          setRelated(rel.length > 0 ? rel : allProducts.filter((p: any) => p.id !== found.id).slice(0, 4));
        } else {
          router.push('/');
        }
      } catch (err) {
        const found = products.find((p: any) => p.id.toString() === id);
        if (found) {
          setProduct(found);
          setRelated(products.filter((p: any) => p.cat === found.cat && p.id !== found.id).slice(0, 4));
        }
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  if (!product) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  const inWL = wishlist.has(product.id);

  const handleAddToCart = () => {
    setIsAdding(true);
    // Add product to cart with the selected quantity
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>←</span> Back to Shop
            </button>
          </div>

          <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>
            
            {/* Left: Image Presentation */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {product.tag && <span className={`p-tag ${product.tag}`} style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '14px', padding: '6px 12px' }}>{product.tagLabel}</span>}
              <button className={`wl-btn ${inWL ? 'on' : ''}`} onClick={() => toggleWishlist(product.id)} style={{ position: 'absolute', top: '10px', right: '10px', width: '40px', height: '40px', fontSize: '20px', zIndex: 10 }}>
                {inWL ? '❤️' : '🤍'}
              </button>
              <img src={product.img} alt={product.name} style={{ width: '100%', maxWidth: '400px', objectFit: 'contain', borderRadius: 'var(--r-md)' }} />
            </div>

            {/* Right: Info & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--orange)' }}>{product.catLabel}</span>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, fontFamily: 'var(--font-d)', lineHeight: 1.1, margin: '8px 0', color: 'var(--text-primary)' }}>{product.name}</h1>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-d)', color: 'var(--text-primary)' }}>{product.price} AED</span>
                  {product.oldPrice && <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>{product.oldPrice} AED</span>}
                </div>
              </div>

              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-raised)', padding: '20px', borderRadius: 'var(--r-md)' }}>
                {product.desc || "Fuel your day with this premium product. Packed with flavor and energy to keep you going."}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', fontWeight: 800, fontSize: '14px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
                In Stock & Ready to Ship
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                {/* Qty Selector */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', padding: '4px' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>−</button>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: 800 }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>+</button>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  style={{ 
                    flex: 1, 
                    background: isAdding ? '#10b981' : 'var(--orange)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 'var(--r-md)', 
                    fontSize: '16px', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    transition: 'all 0.2s',
                    boxShadow: isAdding ? '0 10px 20px rgba(16, 185, 129, 0.3)' : '0 10px 20px rgba(255, 94, 0, 0.3)'
                  }}
                >
                  {isAdding ? '✓ Added' : '🛒 Add to Cart'}
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid var(--border)', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '16px' }}>🚚</span> Fast UAE Delivery
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '16px' }}>💯</span> 100% Authentic
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '16px' }}>🔒</span> Secure Checkout
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {related.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--text-primary)' }}>YOU MAY ALSO LIKE</h3>
              <div className="carousel-outer" style={{ margin: '0 -20px' }}>
                <div className="carousel-wrap">
                  <div className="carousel-track">
                    {related.map((p: any) => {
                      const isWL = wishlist.has(p.id);
                      return (
                        <div key={p.id} className="product-card">
                          <Link href={`/product/${p.id}`} className="prod-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                            <div className="prod-img-wrap">
                              {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                              <img src={p.img} alt={p.name} loading="lazy" />
                            </div>
                          </Link>
                          <button className={`wl-btn ${isWL ? 'on' : ''}`} onClick={() => toggleWishlist(p.id)} style={{ zIndex: 10 }}>
                            {isWL ? '❤️' : '🤍'}
                          </button>
                          <div className="prod-info">
                            <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <div className="prod-name">{p.name}</div>
                            </Link>
                            <div className="prod-price-row">
                              <div className="prod-price">{p.price} AED</div>
                              {p.oldPrice && <div className="prod-old">{p.oldPrice} AED</div>}
                            </div>
                            <button className="atc-btn" onClick={() => addToCart(p)}>
                              🛒 Add to Cart
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
