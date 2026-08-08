'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { canOptimize } from '../lib/imageHosts';
import { stockLabel } from '../lib/stock';

// How many cards a row shows before "Show More" is offered. On the grid this is
// exactly one full row on desktop and two rows of two on a phone.
const INITIAL_CARDS = 4;

export default function ProductList({ productsData, activeCategory, searchQuery, addToCart, toggleWishlist, wishlist, title, categorySlug, eager = false }: any) {
  const [expanded, setExpanded] = useState(false);

  const displayTitle = title || "Hot Picks";
  const [firstWord, ...restWords] = displayTitle.split(" ");
  const restTitle = restWords.join(" ");
  const productsToUse = productsData || [];

  const filtered = productsToUse.filter((p: any) => {
    const matchCat = activeCategory === 'all' || p.cat === activeCategory;
    const matchSearch = p.name.toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchCat && matchSearch;
  });

  const hiddenCount = Math.max(0, filtered.length - INITIAL_CARDS);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_CARDS);

  return (
    <section className="shop-section">
      <div className="sec-head">
        <h2 className="sec-title">{firstWord} {restTitle && <span>{restTitle}</span>}</h2>
        <a className="view-all" href={categorySlug ? `/category/${categorySlug}` : '#'}>View All</a>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>No products found 😅</div>
      ) : (
        <>
          <div className="prod-grid">
            {visible.map((p: any, i: number) => {
              const inWL = wishlist.has(p.id);
              // Only the first row of the first section is worth fetching up
              // front; everything else is below the fold on every screen size.
              const isAboveFold = eager && i < INITIAL_CARDS;
              const stock = stockLabel(p);
              return (
                <div key={p.id} className="product-card" style={{ animationDelay: `${(i % INITIAL_CARDS) * 0.07}s` }}>
                  <Link href={`/product/${p.id}`} className="prod-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div className="prod-img-wrap">
                      {p.tag && <span className={`p-tag ${p.tag}`}>{p.tagLabel}</span>}
                      {p.img && (
                        <Image
                          src={p.img}
                          alt={p.name}
                          fill
                          // Grid cells are fluid now: two per row on phones,
                          // four from tablet up.
                          sizes="(min-width:768px) 25vw, 50vw"
                          // priority already implies eager + high fetch priority.
                          priority={isAboveFold}
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
                      <div className="prod-price">{p.price} AED</div>
                      {p.oldPrice && <div className="prod-old">{p.oldPrice} AED</div>}
                    </div>
                    <div className={`prod-stock ${stock.tone}`}>{stock.text}</div>
                    <button className="atc-btn" onClick={() => addToCart(p)} disabled={p.soldOut}>
                      {p.soldOut ? 'Out of Stock' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {hiddenCount > 0 && (
            <div className="show-more-wrap">
              <button
                type="button"
                className="show-more-btn"
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
              >
                {expanded ? 'Show Less' : `Show More (${hiddenCount})`}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={expanded ? 'flip' : ''}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
