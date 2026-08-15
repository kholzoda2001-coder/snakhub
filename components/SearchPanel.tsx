'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { canOptimize } from '../lib/imageHosts';
import { useLanguage } from '../context/LanguageContext';

type Product = { id: number; name: string; price: number; img?: string; catLabel?: string };

/** Enough to be useful without turning the panel into a second catalogue. */
const MAX_RESULTS = 8;

/**
 * Header search. The catalogue is small, so the whole list is fetched once the
 * first time the panel opens and filtered in the browser — no request per
 * keystroke, which matters on a weak connection.
 */
export default function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    if (!loadedRef.current) {
      loadedRef.current = true;
      fetch('/api/products')
        .then(res => (res.ok ? res.json() : Promise.reject(new Error('bad response'))))
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setFailed(true));
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !products) return [];
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.catLabel || '').toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [query, products]);

  if (!open) return null;

  const searching = query.trim().length > 0;

  return (
    <>
      <div className="overlay active" onClick={onClose} />
      <div className="search-panel" role="dialog" aria-modal="true" aria-label={t('nav.search')}>
        <div className="search-wrap">
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              aria-label={t('nav.search')}
            />
            <button className={`search-clear${query ? ' show' : ''}`} onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label={t('search.clear')}>✕</button>
          </div>
        </div>

        <div className="search-results">
          {failed ? (
            <p className="search-msg">{t('search.failed')}</p>
          ) : !searching ? (
            <p className="search-msg">{t('search.prompt')}</p>
          ) : products === null ? (
            <p className="search-msg">{t('search.loading')}</p>
          ) : results.length === 0 ? (
            <p className="search-msg">{t('search.noMatch', { q: query.trim() })}</p>
          ) : (
            results.map(p => (
              <Link key={p.id} href={`/product/${p.id}`} className="search-hit" onClick={onClose}>
                <span className="search-hit-img">
                  {p.img && (
                    <Image src={p.img} alt="" width={48} height={48} sizes="48px" unoptimized={!canOptimize(p.img)} />
                  )}
                </span>
                <span className="search-hit-text">
                  {p.name}
                  <span className="search-hit-cat">{p.catLabel}</span>
                </span>
                <span className="search-hit-price">{p.price} {t('product.currency')}</span>
              </Link>
            ))
          )}
        </div>

        <button className="search-close" onClick={onClose}>{t('search.close')}</button>
      </div>
    </>
  );
}
