export const SHIPPING_FEE = 20;
export const DISCOUNT_RATE = 0.05;
export const DISCOUNT_MIN_QTY = 2;
export const FREE_SHIPPING_MIN_QTY = 3;
// The site banner promises free delivery over 300 AED, so the cart has to honour it.
export const FREE_SHIPPING_MIN_TOTAL = 300;

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

  // Free either way: 3+ cartons, or the advertised 300 AED threshold (measured
  // after the discount, which is what the customer actually pays).
  const earnsFreeShipping =
    eligibleQty >= FREE_SHIPPING_MIN_QTY || subtotal - discount >= FREE_SHIPPING_MIN_TOTAL;
  const shipping = items.length === 0 || earnsFreeShipping ? 0 : SHIPPING_FEE;

  return {
    cartTotalQty,
    subtotal: money(subtotal),
    discount: money(discount),
    shipping: money(shipping),
    finalTotal: money(subtotal - discount + shipping),
  };
}
