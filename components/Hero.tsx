'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { canOptimize } from '../lib/imageHosts';
import type { ShopBanner } from '../lib/types';

export default function Hero({ banners: bannersProp = [] }: { banners?: ShopBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const banners = bannersProp.filter((b) => b.isActive);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Switching a banner off used to leave the strip parked on a slide that no
  // longer exists, showing an empty panel until the timer came round again.
  const activeIndex = banners.length > 0 ? currentIndex % banners.length : 0;

  // No banners means no strip. There used to be a hard-coded "Monster Ultra
  // Zero" placeholder here pointing at an Unsplash photo — real-looking
  // marketing for a product the shop does not necessarily sell.
  if (banners.length === 0) return null;

  return (
    <section
      className="hero"
      id="home"
      // A compact, wide banner strip. Upload banner images around 1600x500
      // (roughly 3:1) so they fill this cleanly without being cropped.
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div className="hero-glow"></div>
      <div className="hero-grid"></div>
      
      {/* Added transition wrapper */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', width: '100%', transition: 'transform 0.5s ease', transform: `translateX(-${activeIndex * 100}%)` }}>
        {banners.map((banner) => (
          <div key={banner.id} style={{ minWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* ALWAYS treat image as full background. Banner images can be an
                external URL or a base64 blob, so optimisation is only asked
                for on hosts next.config.ts actually allows. */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <Image
                src={banner.img}
                alt={banner.title || banner.eyebrow || 'Banner'}
                fill
                sizes="100vw"
                priority
                unoptimized={!canOptimize(banner.img)}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>

            {/* If there is text, add a subtle gradient overlay so text is readable */}
            {(banner.title || banner.desc || banner.eyebrow) ? (
              <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}></div>
            ) : (
              <Link href={banner.link || '#shop'} style={{ position: 'absolute', inset: 0, zIndex: 5 }}></Link>
            )}

            {/* Content overlay */}
            {(banner.title || banner.desc || banner.eyebrow) && (
              <div className="hero-content" style={{ position: 'relative', zIndex: 3 }}>
                {banner.eyebrow && <div className="hero-eyebrow">{banner.eyebrow}</div>}
                {banner.title && <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: banner.title }}></h1>}
                {banner.desc && <p className="hero-desc">{banner.desc}</p>}
                <Link href={banner.link || '#shop'} className="hero-cta">
                  Shop Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            )}

            {banner.badge && <span className="hero-badge" style={{ zIndex: 4 }}>{banner.badge}</span>}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: index === activeIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                transition: 'background 0.3s ease'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
