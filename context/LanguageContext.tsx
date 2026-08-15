'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DIRECTION, LOCALES, translate, type Locale } from '../lib/i18n/translations';

export const LOCALE_STORAGE_KEY = 'snackhub_lang';

type LanguageValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  isArabic: boolean;
  setLocale: (next: Locale) => void;
  /** Translate a key, optionally filling {placeholders}. */
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the starting language: an explicit choice wins, otherwise the browser's
 * own preference decides. Anything that is not Arabic falls back to English,
 * which is what was asked for — Arabic speakers get Arabic, everyone else
 * gets English rather than a third language they did not ask for.
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage blocked — fall through to the browser preference */
  }

  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const pref of preferences) {
    if (typeof pref === 'string' && pref.toLowerCase().startsWith('ar')) return 'ar';
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Starts as English on both server and client so the first render matches;
  // the real choice is applied in the effect below. The inline script in
  // app/layout.tsx sets <html lang/dir> before paint so nothing visibly flips.
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // The saved language lives in localStorage and navigator, neither of which the server can see, so the first render is always English.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(detectLocale());
  }, []);

  const applyToDocument = useCallback((next: Locale) => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = next;
    document.documentElement.dir = DIRECTION[next];
  }, []);

  useEffect(() => { applyToDocument(locale); }, [locale, applyToDocument]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      // A cookie as well, so the pre-paint script can read it without waiting
      // for JavaScript modules to load.
      document.cookie = `${LOCALE_STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* the choice still applies for this page view */
    }
  }, []);

  const value = useMemo<LanguageValue>(() => ({
    locale,
    dir: DIRECTION[locale],
    isArabic: locale === 'ar',
    setLocale,
    t: (key, vars) => translate(locale, key, vars),
  }), [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Rendering outside the provider should not crash a shop page.
    return {
      locale: 'en',
      dir: 'ltr',
      isArabic: false,
      setLocale: () => {},
      t: (key, vars) => translate('en', key, vars),
    };
  }
  return ctx;
}
