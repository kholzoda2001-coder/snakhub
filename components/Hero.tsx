'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const activeBanners = data.filter(b => b.isActive);
          if (activeBanners.length > 0) setBanners(activeBanners);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    // Default fallback if no banners exist
    return (
      <section className="hero" id="home">
        <div className="hero-glow"></div>
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">New Drop</div>
          <h1 className="hero-title">Monster<em>Ultra</em>Zero</h1>
          <p className="hero-desc">Zero sugar. Zero compromise. Maximum energy to own every moment.</p>
          <a href="#shop" className="hero-cta">
            Shop Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
        <div className="hero-img-default">
          <img src="https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&q=85" alt="Monster Energy" />
        </div>
        <span className="hero-badge">2026 Edition</span>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="hero" id="home" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="hero-glow"></div>
      <div className="hero-grid"></div>
      
      {/* Added transition wrapper */}
      <div style={{ display: 'flex', width: '100%', height: '100%', transition: 'transform 0.5s ease', transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((banner, index) => (
          <div key={banner.id} style={{ minWidth: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* ALWAYS treat image as full background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <img src={banner.img} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>

            {/* If there is text, add a subtle gradient overlay so text is readable */}
            {(banner.title || banner.desc || banner.eyebrow) ? (
              <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}></div>
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
                background: index === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
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
