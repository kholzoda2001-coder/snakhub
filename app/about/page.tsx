'use client';
import React from 'react';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '80vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>About Us</h1>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>
            <p style={{ marginBottom: '16px' }}>
              Welcome to <strong>Fuel Store AE</strong>! We are the UAE's premier destination for high-energy snacks, rare protein supplements, and the wildest energy drinks from around the world.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Founded in Dubai in 2026, our mission is simple: to keep you fueled. Whether you are a late-night gamer, a dedicated athlete, or just someone who needs that extra boost to get through the workday, we have precisely what you need.
            </p>
            <p>
              We pride ourselves on offering same-day delivery across Dubai and next-day delivery to the rest of the Emirates. Stay energized!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
