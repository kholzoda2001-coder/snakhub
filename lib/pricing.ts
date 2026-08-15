export const SHIPPING_FEE = 20;
export const DISCOUNT_RATE = 0.05;
export const DISCOUNT_MIN_QTY = 2;
export const FREE_SHIPPING_MIN_QTY = 3;

export type PricedItem = {
  price: number;
  qty: number;
  isOfferEligible?: boolean;
};

export type Totals = {
  cartTotalQty: number;
  subtotal: number;
  discount: number;
  shipping: number;
  finalTotal: number;
};

function money(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Renders an amount the way a shopper expects to read it. Multiplying a price
 * by a quantity in binary floating point produces things like
 * `189.98 * 3 = 569.9399999999999`, which used to reach the screen verbatim.
 * Whole amounts stay whole ("240"), so prices do not all grow ".00".
 */
export function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '0';
  const rounded = money(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

/**
 * True only when `oldPrice` is a real "was" price. A blank, zero or mistyped
 * value lower than what the shop actually charges must not be shown struck
 * through — that advertises a price increase as a discount.
 */
export function showsOldPrice(price: number, oldPrice: number | null | undefined): oldPrice is number {
  return typeof oldPrice === 'number' && Number.isFinite(oldPrice) && oldPrice > price;
}

/**
 * Single source of truth for order money. The cart renders it and the API
 * recomputes it from database prices — they must never disagree.
 */
export function calculateTotals(items: PricedItem[]): Totals {
  const cartTotalQty = items.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Products without the flag set are treated as eligible, so older rows keep working.
  const eligible = items.filter((item) => item.isOfferEligible !== false);
  const eligibleQty = eligible.reduce((acc, item) => acc + item.qty, 0);
  const eligibleSubtotal = eligible.reduce((acc, item) => acc + item.price * item.qty, 0);

  const discount = eligibleQty >= DISCOUNT_MIN_QTY ? eligibleSubtotal * DISCOUNT_RATE : 0;

  // Free delivery is earned by carton count only. There used to be a 300 AED
  // spend threshold as well; it was removed so the shop advertises one rule.
  const earnsFreeShipping = eligibleQty >= FREE_SHIPPING_MIN_QTY;
  const shipping = items.length === 0 || earnsFreeShipping ? 0 : SHIPPING_FEE;

  return {
    cartTotalQty,
    subtotal: money(subtotal),
    discount: money(discount),
    shipping: money(shipping),
    finalTotal: money(subtotal - discount + shipping),
  };
}
