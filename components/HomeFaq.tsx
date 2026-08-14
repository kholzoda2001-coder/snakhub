'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

/**
 * Short FAQ for the home page. The longer version lives at /faq.
 *
 * The delivery answer is taken straight from lib/pricing.ts — if those
 * constants change, change this too or the page starts promising something the
 * cart will not honour.
 */
const FAQ_KEYS = [1, 2, 3, 4, 5] as const;

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <h2 className="sec-title" id="home-faq-title" style={{ marginBottom: '14px' }}>
        {t('faq.heading')} <span>{t('faq.headingAccent')}</span>
      </h2>

      {FAQ_KEYS.map((n, idx) => {
        const open = openIndex === idx;
        return (
          <div key={n} className={`faq-row${open ? ' open' : ''}`}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={open}
              aria-controls={`faq-a-${idx}`}
              onClick={() => setOpenIndex(open ? null : idx)}
            >
              {t(`faq.q${n}`)}
              <span className="faq-sign" aria-hidden="true">+</span>
            </button>
            {open && (
              <div className="faq-a" id={`faq-a-${idx}`}>{t(`faq.a${n}`)}</div>
            )}
          </div>
        );
      })}

      <div className="home-faq-more">
        <Link href="/faq">{t('faq.seeAll')} →</Link>
      </div>
    </section>
  );
}
