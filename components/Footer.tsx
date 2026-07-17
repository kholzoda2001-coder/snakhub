'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// The built-in info/legal pages that always live in the footer.
const STATIC_LINKS = [
  { slug: 'about', title: 'About Us' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'faq', title: 'FAQ' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms of Sale' },
];
const STATIC_SLUGS = new Set(STATIC_LINKS.map((l) => l.slug));

export default function Footer() {
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/pages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Drop any admin page that would duplicate a built-in link.
          setPages(data.filter((p: any) => !STATIC_SLUGS.has(p.slug)));
        }
      })
      .catch(err => console.error(err));
  }, []);
  return (
    <footer className="site-footer">
      <div className="ft-brand"><img src="/logo.png" alt="Snack Hub" /></div>
      <div className="ft-tag">Your premium snacks & energy destination in the UAE. Fuel your day, the right way.</div>
      
      <div className="ft-links">
        {STATIC_LINKS.map(link => (
          <Link key={link.slug} href={`/${link.slug}`}>{link.title}</Link>
        ))}
        {pages.map(page => (
          <Link key={page.id} href={`/${page.slug}`}>{page.title}</Link>
        ))}
      </div>

      <div className="ft-socials">
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ft-social-link" aria-label="Instagram">
          <svg viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="ft-social-link" aria-label="Facebook">
          <svg viewBox="0 0 24 24">
            <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
          </svg>
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="ft-social-link" aria-label="TikTok">
          <svg viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.72 5.39-1.5 1.76-4.04 2.58-6.32 1.92-2.18-.62-3.8-2.3-4.38-4.52-.3-1.15-.3-2.39-.02-3.54.4-1.63 1.44-3.08 2.87-3.95 1.52-.92 3.42-1.15 5.17-.67V13.6c-2.31-.56-4.88.2-6.19 2.22-.85 1.31-1.01 3.05-.33 4.46.75 1.54 2.56 2.4 4.29 2.22 1.92-.2 3.43-1.71 3.73-3.62.1-.64.12-1.3.12-1.94V.02z"/>
          </svg>
        </a>
      </div>

      <div className="ft-copy">
        © {new Date().getFullYear()} Fuel Store AE. All rights reserved.<br />
        Delivering high energy across Dubai & the UAE.
      </div>
    </footer>
  );
}
