/**
 * Per-category selling rules.
 *
 * Some lines are imported rarities: too expensive to hand to a driver on cash,
 * and weeks in transit rather than days. The rules live on the category so the
 * shop can add another premium line without a code change.
 *
 * The browser and /api/orders both read this file, so a cart the customer sees
 * as card-only cannot be posted as cash by editing the request.
 */

export type CategoryRule = {
  cardOnly: boolean;
  /** Overrides the emirate estimate for anything in this category. */
  deliveryEstimate?: string | null;
};

export type CategoryRules = Record<string, CategoryRule>;

/** Minimal shape needed to judge a cart — the real cart item has much more. */
export type RuledItem = {
  name?: string;
  cat?: string;
};

/** Products from card-only categories, in cart order. */
export function cardOnlyItems<T extends RuledItem>(items: T[], rules: CategoryRules): T[] {
  return (items || []).filter((item) => item.cat && rules[item.cat]?.cardOnly);
}

/** True when this cart may not be paid for on delivery. */
export function requiresCard(items: RuledItem[], rules: CategoryRules): boolean {
  return cardOnlyItems(items || [], rules).length > 0;
}

/**
 * The estimate to show for a whole cart.
 *
 * An order ships together, so the slowest thing in it sets the expectation —
 * a category estimate always beats the address-based one.
 */
export function cartDeliveryEstimate(
  items: RuledItem[],
  rules: CategoryRules,
  fallback: string
): string {
  for (const item of items || []) {
    const estimate = item.cat ? rules[item.cat]?.deliveryEstimate : null;
    if (estimate && estimate.trim()) return estimate.trim();
  }
  return fallback;
}

/** Normalises rows from the database into the lookup both sides use. */
export function toRules(
  categories: { slug: string; cardOnly?: boolean | null; deliveryEstimate?: string | null }[]
): CategoryRules {
  const rules: CategoryRules = {};
  for (const c of categories || []) {
    if (!c?.slug) continue;
    rules[c.slug] = {
      cardOnly: Boolean(c.cardOnly),
      deliveryEstimate: c.deliveryEstimate?.trim() || null,
    };
  }
  return rules;
}
