/**
 * How long delivery takes, per emirate.
 *
 * The real figures are the shop's to set, so everything here starts from one
 * editable default rather than invented per-city promises. Admin → Settings
 * writes the `delivery_estimates` key; checkout and the order confirmation both
 * read it, so a change lands in one place instead of three.
 */

export const UAE_CITIES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const;

export const SETTINGS_KEY = 'delivery_estimates';

/** Matches the wording already used on the order confirmation page. */
export const DEFAULT_ESTIMATE = '1–2 days';

export type DeliveryEstimates = {
  /** Used for any emirate without its own entry. */
  default: string;
  byCity: Record<string, string>;
};

export const FALLBACK_ESTIMATES: DeliveryEstimates = {
  default: DEFAULT_ESTIMATE,
  byCity: {},
};

/** Reads the stored JSON defensively — a malformed value must not break checkout. */
export function parseEstimates(raw: string | null | undefined): DeliveryEstimates {
  if (!raw) return FALLBACK_ESTIMATES;
  try {
    const parsed = JSON.parse(raw);
    const byCity: Record<string, string> = {};
    if (parsed && typeof parsed.byCity === 'object' && parsed.byCity) {
      for (const city of UAE_CITIES) {
        const value = parsed.byCity[city];
        if (typeof value === 'string' && value.trim()) byCity[city] = value.trim();
      }
    }
    const fallback = typeof parsed?.default === 'string' && parsed.default.trim()
      ? parsed.default.trim()
      : DEFAULT_ESTIMATE;
    return { default: fallback, byCity };
  } catch {
    return FALLBACK_ESTIMATES;
  }
}

export function estimateFor(city: string | null | undefined, estimates: DeliveryEstimates): string {
  if (city && estimates.byCity[city]) return estimates.byCity[city];
  return estimates.default || DEFAULT_ESTIMATE;
}

export function serialiseEstimates(estimates: DeliveryEstimates): string {
  return JSON.stringify({
    default: estimates.default?.trim() || DEFAULT_ESTIMATE,
    byCity: Object.fromEntries(
      Object.entries(estimates.byCity || {})
        .map(([city, value]) => [city, String(value ?? '').trim()])
        .filter(([, value]) => value)
    ),
  });
}
