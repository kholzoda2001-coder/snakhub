'use client';
import React from 'react';
import Link from 'next/link';

export default function SideNav({ isMenuOpen, toggleMenu }: any) {
  return (
    <>
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
      ></div>
      <nav className={`side-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="panel-header">
          <div className="panel-logo"><em>FUEL</em> STORE<sub>AE</sub></div>
          <button className="close-x" onClick={toggleMenu} aria-label="Close menu">✕</button>
        </div>
        <div className="side-links">
          <Link href="/" onClick={toggleMenu}>
            🏠 <span>Home</span>
          </Link>
          
          <div style={{ padding: '12px 18px 4px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Categories
          </div>
          
          <Link href="/category/redbull" onClick={toggleMenu}>
            ⚡ <span>Red Bull</span>
          </Link>
          <Link href="/category/monster" onClick={toggleMenu}>
            🟢 <span>Monster Energy</span>
          </Link>
          <Link href="/category/protein" onClick={toggleMenu}>
            💪 <span>Protein & Fitness</span>
          </Link>
          <Link href="/category/snacks" onClick={toggleMenu}>
            🍟 <span>Chips & Snacks</span>
          </Link>

          <div style={{ padding: '12px 18px 4px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '8px' }}>
            My Account
          </div>

          <Link href="/wishlist" onClick={toggleMenu}>
            ❤️ <span>My Wishlist</span>
          </Link>
          <a href="#" onClick={toggleMenu}>
            📦 <span>My Orders</span>
          </a>
          <a href="#" onClick={toggleMenu}>
            🎧 <span>Support / Chat</span>
          </a>
        </div>
        <div className="side-nav-footer">
          © 2026 Fuel Store AE. All rights reserved.
        </div>
      </nav>
    </>
  );
}
