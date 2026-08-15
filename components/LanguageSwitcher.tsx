'use client';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Single toggle rather than a dropdown: with exactly two languages, the button
 * shows the one you are not using, so a tap always does the obvious thing.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const next = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      className="lang-switch"
      onClick={() => setLocale(next)}
      aria-label={`${t('lang.label')}: ${next === 'ar' ? 'العربية' : 'English'}`}
      title={t('lang.label')}
    >
      <span aria-hidden="true">🌐</span>
      <span>{t('lang.switchTo')}</span>
    </button>
  );
}
