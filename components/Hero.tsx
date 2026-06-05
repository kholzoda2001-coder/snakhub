'use client';
import React from 'react';

export default function Hero() {
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
      <div className="hero-img">
        <img src="https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&q=85" alt="Monster Energy" />
      </div>
      <span className="hero-badge">2026 Edition</span>
    </section>
  );
}
