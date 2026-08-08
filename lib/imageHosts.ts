import imageHosts from '../image-hosts.json';

/**
 * Hosts the Next.js image optimizer is allowed to fetch from.
 *
 * The list lives in `image-hosts.json` because `next.config.ts` needs it too,
 * and that file cannot import TypeScript (see the note there). Both sides read
 * the one JSON file, so they can never drift apart.
 *
 * Deliberately an allowlist rather than `**`: a wide-open optimizer lets anyone
 * hand it arbitrary URLs and use the site as an image proxy at your bandwidth's
 * expense.
 *
 * Add a host to the JSON when the admin starts using a new CDN. Until then,
 * images from unknown hosts still display — `canOptimize` sends them straight
 * to the browser unoptimized rather than letting them fail.
 */
export const OPTIMIZED_IMAGE_HOSTS: readonly string[] = imageHosts;

/**
 * Whether `src` can go through the optimizer. Same-origin paths (the base64
 * images served by /api/images) always can; external URLs only if allowlisted.
 */
export function canOptimize(src: string | null | undefined): boolean {
  if (!src) return false;
  if (!/^https?:\/\//i.test(src)) return true;
  try {
    return OPTIMIZED_IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}
