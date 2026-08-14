'use client';
import React from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

/**
 * The shop's loading state: the Snack Hub mark breathing over a moving bar.
 *
 * Replaces the bare "Loading..." text that used to appear on the product,
 * category, wishlist and checkout pages. Only transform and opacity animate, so
 * it stays smooth on high-refresh screens, and it collapses to a still frame
 * for anyone who asks their OS for reduced motion.
 *
 * `full` centres it in the viewport for whole-page waits; without it the loader
 * sits inline where the content will appear.
 */
export default function Loader({ labelKey = 'state.loading', full = false }: { labelKey?: string; full?: boolean }) {
  const { t } = useLanguage();
  const label = t(labelKey);
  return (
    <div className={`sh-loader${full ? ' full' : ''}`} role="status" aria-live="polite">
      <div className="sh-loader-mark">
        <Image src="/logo.png" alt="" aria-hidden="true" width={708} height={156} sizes="200px" />
      </div>
      <div className="sh-loader-bar"><span /></div>
      {/* Announced by screen readers; the mark alone says nothing to them. */}
      <span className="sh-visually-hidden">{label}</span>
    </div>
  );
}
