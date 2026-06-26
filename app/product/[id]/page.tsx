'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopShell from '../../../components/ShopShell';
import Footer from '../../../components/Footer';
import { useCart } from '../../../context/CartContext';
import { products } from '../../../data/products'; // fallback data

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState('');
  const [related, setRelated] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const { addToCart, updateQty, wishlist, toggleWishlist } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        const [prodRes, allRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/products')
        ]);
        
        if (prodRes.ok) {
          const found = await prodRes.json();
          setProduct(found);
          setActiveImg(found.img);
          
          if (allRes.ok) {
            const allProducts = await allRes.json();
            const rel = allProducts.filter((p: any) => p.cat === found.cat && p.id !== found.id).slice(0, 4);
            setRelated(rel.length > 0 ? rel : allProducts.filter((p: any) => p.id !== found.id).slice(0, 4));
          }
        } else {
          router.push('/');
        }
      } catch (err) {
        router.push('/');
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  if (!product) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  const inWL = wishlist.has(product.id);

  const handleAddToCart = (openCart: boolean) => {
    if (!openCart) setIsAdding(true);
    // Add product to cart with the selected quantity
    for (let i = 0; i < qty; i++) {
      addToCart(product, openCart);
    }
    if (!openCart) setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>←</span> Back to Shop
            </button>
          </div>

          <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>
            
            {/* Left: Image Presentation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', aspectRatio: '1/1', background: 'var(--bg-raised)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                {product.tag && <span className={`p-tag ${product.tag}`} style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '14px', padding: '6px 12px' }}>{product.tagLabel}</span>}
                <button className={`wl-btn ${inWL ? 'on' : ''}`} onClick={() => toggleWishlist(product.id)} style={{ position: 'absolute', top: '10px', right: '10px', width: '40px', height: '40px', fontSize: '20px', zIndex: 10 }}>
                  {inWL ? '❤️' : '🤍'}
                </button>
                <img src={activeImg || product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Gallery Thumbnails */}
              {product.images && Array.isArray(product.images) && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }}>
                  {product.images.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImg(img)}
                      style={{ 
                        flexShrink: 0, 
                        width: '70px', 
                        height: '70px', 
                        borderRadius: 'var(--r-sm)', 
                        overflow: 'hidden', 
                        border: activeImg === img ? '2px solid var(--orange)' : '2px solid transparent',
                        background: 'var(--bg-raised)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', fontWeight: 800, fontSize: '14px', marginTop: '4px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
                In Stock & Ready to Ship
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', alignItems: 'stretch', height: '54px' }}>
                {/* Qty Selector */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-raised)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', padding: '0 4px', flexShrink: 0, width: '100px', justifyContent: 'space-between', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '30px', height: '100%', border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e=>e.currentTarget.style.color='var(--orange)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-secondary)'}>−</button>
                  <span style={{ fontWeight: 900, fontSize: '15px', color: 'var(--text-primary)' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ width: '30px', height: '100%', border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e=>e.currentTarget.style.color='var(--orange)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-secondary)'}>+</button>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={() => handleAddToCart(false)}
                  style={{ 
                    flex: 1, 
                    background: isAdding ? '#10b981' : 'var(--bg-main)', 
                    color: isAdding ? '#fff' : 'var(--text-primary)', 
                    border: isAdding ? '2px solid #10b981' : '2px solid var(--border)', 
                    borderRadius: 'var(--r-md)', 
                    fontSize: '14px', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    boxShadow: isAdding ? '0 8px 16px rgba(16,185,129,0.2)' : '0 4px 6px rgba(0,0,0,0.02)',
                    padding: '0 4px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={e => { if(!isAdding) e.currentTarget.style.borderColor = 'var(--orange)'; }}
                  onMouseOut={e => { if(!isAdding) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {isAdding ? '✓ Added' : '🛒 Cart'}
                </button>

                {/* Buy Now Button */}
                <button 
                  onClick={() => handleAddToCart(true)}
                  style={{ 
                    flex: 1.5, 
                    background: 'linear-gradient(135deg, var(--orange) 0%, #ff5e00 100%)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 'var(--r-md)', 
                    fontSize: '14px', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 20px rgba(255, 94, 0, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    padding: '0 4px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ⚡ Buy Now
                </button>
              </div>
              {/* Wholesale Contact */}
              <div style={{ marginTop: '24px', background: 'rgba(37, 211, 102, 0.05)', border: '1px solid rgba(37, 211, 102, 0.2)', padding: '16px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Need Wholesale Prices?</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Get special rates for bulk orders</span>
                </div>
                <a 
                  href={`https://wa.me/971561144518?text=Hello,%20I%20would%20like%20to%20know%20the%20wholesale%20price%20for%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '10px 16px', borderRadius: '20px', textDecoration: 'none', fontWeight: 800, fontSize: '13px', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  WhatsApp
                </a>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--border)', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px', scrollbarWidth: 'none' }}>
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
      <Footer />
    </>
  );
}
