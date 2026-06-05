'use client';
import React from 'react';

export default function Header({ toggleTheme, toggleCart, toggleMenu, cartCount }: any) {
  return (
    <>
      <div className="delivery-banner">
        <span className="live-dot"></span>
        🚀 FREE DELIVERY on orders over <span className="hl">300 AED</span> — Same day, UAE-wide!
      </div>
      <header className="site-header">
        <div className="header-left">
          <button className="menu-btn" onClick={toggleMenu} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
          <div className="brand-logo"><em>FUEL</em> STORE<sub>AE</sub></div>
        </div>
        <div className="header-right">
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">🌙</button>
          <button className="icon-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button className="icon-btn" onClick={toggleCart} aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span className="hdr-badge" id="cartBadge">{cartCount}</span>
          </button>
        </div>
      </header>
    </>
  );
}
