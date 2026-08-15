'use client';
import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

const MESSAGE_KEYS = [
  ['🚚', 'promo.freeDelivery'],
  ['💰', 'promo.bestRates'],
  ['💯', 'promo.original'],
  ['⚡', 'promo.nextDay'],
] as const;

/**
 * Scrolling promise bar plus the language toggle.
 *
 * The sequence is rendered twice and the track slides by exactly half its
 * width, so the loop has no visible seam. In Arabic the crawl runs the other
 * way, because right-to-left text scrolling leftwards reads backwards.
 */
export default function AnnouncementBar() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="announce-strip">
      <div className="announce-bar" role="region" aria-label={t('promo.region')}>
        <div className={`announce-track${isArabic ? ' rtl' : ''}`}>
          {[0, 1].map((copy) => (
            <div className="announce-seq" key={copy} aria-hidden={copy === 1}>
              {MESSAGE_KEYS.map(([icon, key]) => (
                <span className="announce-item" key={key}>
                  {icon} {t(key)}
                  <span className="announce-dot" aria-hidden="true">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  );
}
