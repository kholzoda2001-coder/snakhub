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

/**
 * Estimates are free text typed by the shop, so they are stored in English and
 * translated on the way out. Only the shapes the admin form suggests are
 * recognised; anything else is shown as typed rather than mangled.
 *
 * Arabic counts its nouns: one is يوم, two is يومين, three to ten take the
 * plural أيام, and eleven upwards goes back to the singular.
 */
export function localiseEstimate(estimate: string, locale: string): string {
  const text = String(estimate ?? '').trim();
  if (locale !== 'ar' || !text) return text;

  const lower = text.toLowerCase();
  if (lower === 'same day') return 'نفس اليوم';
  if (lower === 'next day') return 'اليوم التالي';

  const days = (n: number) =>
    n === 1 ? 'يوم' : n === 2 ? 'يومين' : n <= 10 ? `${n} أيام` : `${n} يوماً`;

  // "5–10 days", "5-10 days", "5 to 10 days"
  const range = lower.match(/^(\d+)\s*(?:[–—-]|to)\s*(\d+)\s*days?$/);
  if (range) {
    const from = Number(range[1]);
    const to = Number(range[2]);
    return from === 1 && to === 2 ? 'يوم إلى يومين' : `${from}–${to} ${to <= 10 ? 'أيام' : 'يوماً'}`;
  }

  const single = lower.match(/^(\d+)\s*days?$/);
  if (single) return days(Number(single[1]));

  return text;
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
