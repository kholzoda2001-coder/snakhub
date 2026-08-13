/**
 * One place that decides what a shopper is told about availability, so the
 * cards, the category grid, the wishlist and the product page can never
 * disagree with each other — or with what /api/orders will actually accept.
 */

/** At or below this many units left, the card nudges the shopper. */
export const LOW_STOCK_THRESHOLD = 5;

export type StockInfo = {
  /** True only when stock tracking is on AND nothing is left. */
  soldOut: boolean;
  /** Units remaining, or null when Admin → Settings → Track stock levels is off. */
  stockLeft: number | null;
};

/**
 * Resolves a product's raw `stock` column against the shop-wide tracking
 * setting. With tracking off the number is ignored, because /api/orders ignores
 * it too — claiming "out of stock" for something the shop will happily sell
 * would be a lie.
 */
export function stockInfo(stock: number | null | undefined, trackStock: boolean): StockInfo {
  if (!trackStock) return { soldOut: false, stockLeft: null };
  const left = Math.max(0, Math.trunc(stock ?? 0));
  return { soldOut: left <= 0, stockLeft: left };
}

export type StockLabel = {
  /** English text, for places with no translator to hand (admin, exports). */
  text: string;
  /** Translation key, so the storefront can render this in Arabic. */
  key: 'product.outOfStock' | 'product.onlyLeft' | 'product.inStock';
  /** Fills the {n} placeholder in product.onlyLeft. */
  vars?: { n: number };
  /** Maps to the .prod-stock modifier classes in globals.css. */
  tone: 'ok' | 'low' | 'out';
};

export function stockLabel(info: Partial<StockInfo> | null | undefined): StockLabel {
  if (info?.soldOut) {
    return { text: '⛔ Out of stock', key: 'product.outOfStock', tone: 'out' };
  }

  const left = info?.stockLeft;
  if (typeof left === 'number' && left <= LOW_STOCK_THRESHOLD) {
    return { text: `⚠️ Only ${left} left`, key: 'product.onlyLeft', vars: { n: left }, tone: 'low' };
  }

  return { text: '✅ In stock', key: 'product.inStock', tone: 'ok' };
}
