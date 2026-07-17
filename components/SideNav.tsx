'use client';
import React from 'react';
import Link from 'next/link';

export default function SideNav({ isMenuOpen, toggleMenu }: any) {
  const [categories, setCategories] = React.useState<any[]>([]);
  const loadedRef = React.useRef(false);

  // The menu is hidden on first paint, so its categories are fetched only once
  // the shopper actually opens it.
  React.useEffect(() => {
    if (!isMenuOpen || loadedRef.current) return;
    loadedRef.current = true;
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [isMenuOpen]);

  // Lock body scroll when sidebar is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMenuOpen]);


  return (
    <>
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
      ></div>
      <nav className={`side-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="panel-header">
          <div className="panel-logo">
            <img src="/logo.png" alt="Snack Hub" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <button className="close-x" onClick={toggleMenu} aria-label="Close menu">✕</button>
        </div>
        <div className="side-links">
          <Link href="/" onClick={toggleMenu}>
            🏠 <span>Home</span>
          </Link>
          
          <div style={{ padding: '12px 18px 4px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Categories
          </div>
          
          {categories.map(c => (
            <Link key={c.id} href={`/category/${c.slug}`} onClick={toggleMenu}>
              {c.icon || '📦'} <span>{c.name}</span>
            </Link>
          ))}

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
          © {new Date().getFullYear()} Snack Hub. All rights reserved.
        </div>
      </nav>
    </>
  );
}
