'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

// How far down the page the shrink is allowed to kick in, and how much
// movement counts as a real scroll rather than trackpad/touch jitter.
const SHRINK_AFTER = 60;
const DIRECTION_THRESHOLD = 4;

export default function Header({ toggleCart, toggleMenu, toggleSearch, cartCount }: any) {
  const [shrunk, setShrunk] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    // The scroll position is read inside a rAF callback instead of in the
    // listener itself, so a burst of scroll events collapses into one read per
    // frame. On a 120Hz screen that is one read every ~8ms rather than dozens.
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;

      if (Math.abs(delta) < DIRECTION_THRESHOLD) return;
      lastY = y;

      // Near the top the logo is always full size; below that the scroll
      // direction decides — down shrinks it, up restores it.
      setShrunk(y > SHRINK_AFTER && delta > 0);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    // Passive: this listener never calls preventDefault, and saying so up front
    // lets the browser scroll without waiting on the main thread.
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <button className="menu-btn" onClick={toggleMenu} aria-label={t('nav.menu')}>
            <span></span><span></span><span></span>
          </button>
        </div>
        <div className={`brand-logo${shrunk ? ' shrunk' : ''}`}>
          <Link href="/" aria-label={t('nav.home.aria')}>
            {/* On screen at ~150px wide; the source is 708px, so let the
                optimizer serve a right-sized AVIF/WebP instead of 118KB PNG. */}
            {/* `sizes` is what tells the browser this is a ~200px slot. Without
                it, next/image falls back to a 1x/2x srcset off the 708px
                intrinsic width and a retina screen pulls a 1920px render. */}
            <Image src="/logo.png" alt="Snack Hub" width={708} height={156} sizes="(min-width:768px) 260px, 200px" priority />
          </Link>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={toggleSearch} aria-label={t('nav.search')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button className="icon-btn" onClick={toggleCart} aria-label={t('nav.cart')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span className="hdr-badge" id="cartBadge">{cartCount}</span>
          </button>
        </div>
      </header>
    </>
  );
}
