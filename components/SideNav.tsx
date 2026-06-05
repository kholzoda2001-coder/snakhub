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
          <Link href="/admin" onClick={toggleMenu}>
            ⚙️ <span>Admin Panel</span>
            <span className="snl-badge">Admin</span>
          </Link>
          <a href="#" onClick={toggleMenu}>
            ❤️ <span>My Wishlist</span>
          </a>
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
