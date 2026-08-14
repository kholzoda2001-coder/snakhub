/**
 * The shapes the storefront and admin actually pass around.
 *
 * These deliberately describe what the API returns rather than re-exporting
 * Prisma's model types: the API adds fields Prisma does not have (`img` is
 * resolved to a URL, `soldOut`/`stockLeft` are derived from the shop's stock
 * setting) and omits ones it must never send (raw image blobs).
 */

import type { StockInfo } from './stock';

/** A product as the shop pages receive it, from /api/products or getShopProducts(). */
export type ShopProduct = StockInfo & {
  id: number;
  name: string;
  cat: string;
  catLabel: string;
  price: number;
  /** The "was" price. Only shown when it is genuinely higher — see showsOldPrice(). */
  oldPrice?: number | null;
  tag?: string | null;
  tagLabel?: string | null;
  isOfferEligible?: boolean;
  desc?: string;
  /** Ready to put straight in a src: an external URL or an /api/images path. */
  img?: string;
  images?: string[];
};

/** A line in the cart. Carries its own copy of the product's display fields. */
export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
  /** Category slug, read by the per-category selling rules. */
  cat?: string;
  catLabel: string;
  isOfferEligible?: boolean;
};

/** A category row, as /api/categories returns it. */
export type ShopCategory = {
  id: number;
  slug: string;
  name: string;
  icon?: string | null;
  img?: string | null;
  order?: number;
  cardOnly?: boolean;
  deliveryEstimate?: string | null;
};

/** A banner row, as /api/banners returns it. */
export type ShopBanner = {
  id: number;
  title: string;
  eyebrow?: string | null;
  desc?: string | null;
  img: string;
  badge?: string | null;
  link?: string | null;
  isActive: boolean;
};

/** An editable content page (About, Privacy, Terms…). */
export type ShopPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  updatedAt?: string;
};

/**
 * A product row in the admin list. Distinct from ShopProduct: it carries the
 * buy price and raw stock count the shop pages must never receive, and it has
 * no resolved soldOut/stockLeft — the admin sees the real number instead.
 */
export type AdminProduct = {
  id: number;
  name: string;
  cat: string;
  catLabel: string;
  price: number;
  oldPrice?: number | null;
  /** Always selected by /api/products?admin=true, so the list can rely on it. */
  cost: number;
  stock: number;
  tag?: string | null;
  tagLabel?: string | null;
  isOfferEligible?: boolean;
  desc?: string;
  img?: string;
  images?: string[];
  viewers?: number;
  createdAt?: string;
};

/** An order row as the admin screens receive it. */
export type AdminOrder = {
  id: number;
  name: string;
  phone: string;
  address: string;
  items: OrderLine[];
  total: number;
  /** Payment state: Pending, Pending Payment, Paid, Failed. */
  status: string;
  /** Delivery state, kept separate from payment: Unfulfilled, Processing, Fulfilled, Cancelled. */
  fulfillment?: string;
  paymentIntentId?: string | null;
  contactedAt?: string | null;
  createdAt: string;
  companyId?: number | null;
  company?: { name: string; phone: string } | null;
};

/** Reads a thrown value's message without assuming it is an Error. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.') {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** One line of a placed order, as stored in Order.items. */
export type OrderLine = {
  id: number;
  name: string;
  price: number;
  qty: number;
  catLabel?: string;
  cost?: number;
  isOfferEligible?: boolean;
};
