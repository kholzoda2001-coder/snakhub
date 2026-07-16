import { prisma } from './prisma';

// Long enough for any real image URL, short enough that reading it never drags
// a multi-megabyte base64 blob out of the database.
const URL_PROBE_LENGTH = 400;

export function imageUrlFor(id: number, index = 0) {
  return `/api/images/${id}?index=${index}`;
}

/**
 * Images are stored either as an external URL or as base64 data. External URLs
 * are handed to the browser as-is; base64 goes through /api/images, which is an
 * extra request per image, so it is only used when it is actually needed.
 */
export function publicImageSrc(id: number, stored: string | null | undefined, index = 0) {
  if (stored && stored.startsWith('http')) return stored;
  return imageUrlFor(id, index);
}

/**
 * Resolves list thumbnails without selecting the whole `img` column.
 * Returns a map of product id -> src.
 */
export async function resolveThumbnails(ids: number[]): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  if (ids.length === 0) return result;

  try {
    const rows = await prisma.$queryRawUnsafe<{ id: number; imgHead: string | null }[]>(
      `SELECT id, LEFT(img, ${URL_PROBE_LENGTH}) AS imgHead FROM Product WHERE id IN (${ids.map(() => '?').join(',')})`,
      ...ids
    );

    for (const row of rows) {
      const head = row.imgHead ?? '';
      // A truncated value can't be a complete URL, so treat it as base64.
      const isCompleteUrl = head.startsWith('http') && head.length < URL_PROBE_LENGTH;
      result.set(row.id, isCompleteUrl ? head : imageUrlFor(row.id));
    }
  } catch (error) {
    // Falling back to the proxy is slower but always correct.
    console.error('Thumbnail resolution failed, falling back to /api/images:', error);
    for (const id of ids) result.set(id, imageUrlFor(id));
  }

  for (const id of ids) if (!result.has(id)) result.set(id, imageUrlFor(id));
  return result;
}
