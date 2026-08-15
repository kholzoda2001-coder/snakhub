'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WHOLESALE_HIDDEN_CATEGORIES } from '../lib/wholesaleCategories';

type WholesaleCompany = { id: number; name: string } | null;

type WholesaleContextType = {
  company: WholesaleCompany;
  prices: Record<number, number>;
  loading: boolean;
  refresh: () => void;
};

const WholesaleContext = createContext<WholesaleContextType>({
  company: null,
  prices: {},
  loading: true,
  refresh: () => {},
});

export function WholesaleProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<WholesaleCompany>(null);
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/wholesale/me')
      .then((res) => res.json())
      .then((data) => {
        setCompany(data.company ?? null);
        setPrices(data.prices ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <WholesaleContext.Provider value={{ company, prices, loading, refresh: load }}>
      {children}
    </WholesaleContext.Provider>
  );
}

export function useWholesale() {
  return useContext(WholesaleContext);
}

export function isWholesaleHiddenCategory(slug: string | undefined | null, company: WholesaleCompany) {
  return Boolean(company) && Boolean(slug) && WHOLESALE_HIDDEN_CATEGORIES.includes(slug as string);
}

/** Drops products in wholesale-hidden categories once a company is logged in; a no-op for regular shoppers. */
export function filterWholesaleCategories<T extends { cat?: string }>(products: T[], company: WholesaleCompany): T[] {
  if (!company || !products) return products;
  return products.filter((p) => !WHOLESALE_HIDDEN_CATEGORIES.includes(p.cat as string));
}

/** Swaps in this company's negotiated price where one is set; retail price moves to oldPrice so it still shows as a strike-through. */
export function applyWholesalePricing<T extends { id: number; price: number; oldPrice?: number | null }>(
  products: T[],
  prices: Record<number, number>
): T[] {
  if (!products || Object.keys(prices).length === 0) return products;
  return products.map((p) => {
    const override = prices[p.id];
    return override === undefined ? p : { ...p, price: override, oldPrice: p.price };
  });
}
