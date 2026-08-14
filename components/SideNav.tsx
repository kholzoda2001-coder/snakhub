'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { isWholesaleHiddenCategory, useWholesale } from '../context/WholesaleContext';
import type { ShopCategory } from '../lib/types';

export default function SideNav({ isMenuOpen, toggleMenu }: { isMenuOpen: boolean; toggleMenu: () => void }) {
  const { t } = useLanguage();
  const { company } = useWholesale();
  const [categories, setCategories] = React.useState<ShopCategory[]>([]);
  const loadedRef = React.useRef(false);
  const visibleCategories = categories.filter((c) => !isWholesaleHiddenCategory(c.slug, company));

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
            <Image src="/logo.png" alt="Snack Hub" width={708} height={156} sizes="170px" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <button className="close-x" onClick={toggleMenu} aria-label="Close menu">✕</button>
        </div>
        <div className="side-links">
          <Link href="/" onClick={toggleMenu}>
            <span className="snl-icon">🏠</span> <span>{t('nav.home')}</span>
          </Link>

          <div className="side-group-label">{t('nav.categories')}</div>

          {visibleCategories.map(c => (
            <Link key={c.id} href={`/category/${c.slug}`} onClick={toggleMenu}>
              <span className="snl-icon">{c.icon || '📦'}</span> <span>{c.name}</span>
            </Link>
          ))}

          <div className="side-group-label">{t('nav.myAccount')}</div>

          <Link href="/wishlist" onClick={toggleMenu}>
            <span className="snl-icon">❤️</span> <span>{t('nav.wishlist')}</span>
          </Link>
          <Link href="/orders" onClick={toggleMenu}>
            <span className="snl-icon">📦</span> <span>{t('nav.orders')}</span>
          </Link>
          <Link href={company ? '/wholesale/orders' : '/wholesale/login'} onClick={toggleMenu}>
            <span className="snl-icon">🏢</span> <span>{company ? company.name : t('nav.wholesale')}</span>
          </Link>
          <a href="#" onClick={toggleMenu}>
            <span className="snl-icon">🎧</span> <span>{t('nav.support')}</span>
          </a>
        </div>
        <div className="side-nav-footer">
          © {new Date().getFullYear()} Snack Hub. {t('footer.rights')}
        </div>
      </nav>
    </>
  );
}
