'use client';
import React from 'react';
import { products } from '../data/products';

export default function ProductList({ productsData, activeCategory, searchQuery, addToCart, toggleWishlist, wishlist }: any) {
  const productsToUse = productsData && productsData.length > 0 ? productsData : products;
  
  const filtered = productsToUse.filter((p: any) => {
    const matchCat = activeCategory === 'all' || p.cat === activeCategory;
    const matchSearch = p.name.toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="shop">
      <div className="sec-head">
        <h2 className="sec-title">Hot <span>Picks</span></h2>
        <a className="view-all" href="#">View All</a>
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
                    <div className="prod-img-wrap">
                      {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                      <img src={p.img} alt={p.name} loading="lazy" />
                      <button className={`wl-btn ${inWL ? 'on' : ''}`} onClick={() => toggleWishlist(p.id)}>
                        {inWL ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="prod-info">
                      <div className="prod-name">{p.name}</div>
                      <div className="prod-price-row">
                        <div className="prod-price">{p.price} AED</div>
                        {p.oldPrice && <div className="prod-old">{p.oldPrice} AED</div>}
                      </div>
                      <div className="prod-stock">✅ In stock</div>
                      <button className="atc-btn" onClick={() => addToCart(p.id)}>
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
