import React from 'react';
import Link from 'next/link';
import ShopShell from '../components/ShopShell';
import Footer from '../components/Footer';

/**
 * Shown for every 404: an unknown page slug, a category the shop does not sell
 * and a product id that no longer exists. It keeps the header, cart and footer
 * so a wrong link is a dead end for one URL, not for the whole shop.
 */
export default function NotFound() {
  return (
    <>
      <ShopShell />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '520px', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🔍</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-d)', margin: '0 0 12px', color: 'var(--text-primary)' }}>
            PAGE NOT FOUND
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px', fontWeight: 500 }}>
            This link does not lead anywhere. The page may have moved, or the
            product may no longer be stocked.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block', background: 'var(--orange)', color: '#fff',
              padding: '14px 32px', borderRadius: '50px', fontWeight: 800,
              textDecoration: 'none', fontSize: '15px',
              boxShadow: '0 12px 24px rgba(255, 94, 0, 0.25)',
            }}
          >
            Back to the shop
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
