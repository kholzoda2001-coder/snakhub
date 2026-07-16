'use client';
import React from 'react';
import Link from 'next/link';

export default function ProductList({ productsData, activeCategory, searchQuery, addToCart, toggleWishlist, wishlist, title, categorySlug }: any) {
  const displayTitle = title || "Hot Picks";
  const [firstWord, ...restWords] = displayTitle.split(" ");
  const restTitle = restWords.join(" ");
  const productsToUse = productsData || [];
  
  const filtered = productsToUse.filter((p: any) => {
    const matchCat = activeCategory === 'all' || p.cat === activeCategory;
    const matchSearch = p.name.toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section className="shop-section" style={{ marginBottom: '40px' }}>
      <div className="sec-head">
        <h2 className="sec-title">{firstWord} {restTitle && <span>{restTitle}</span>}</h2>
        <a className="view-all" href={categorySlug ? `/category/${categorySlug}` : '#'}>View All</a>
      </div>
      <div className="carousel-outer">
        <div className="carousel-wrap">
          <div className="carousel-track" id="productsTrack">
            {filtered.length === 0 ? (
              <div style={{padding:'20px 0',color:'var(--text-muted)',fontSize:'14px',fontWeight:600}}>No products found 😅</div>
            ) : (
              filtered.map((p: any, i: number) => {
                const inWL = wishlist.has(p.id);
                return (
                  <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    <Link href={`/product/${p.id}`} className="prod-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <div className="prod-img-wrap">
                        {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                        <img src={p.img} alt={p.name} loading="lazy" />
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
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
