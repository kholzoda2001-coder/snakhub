/**
 * Keeps the half-filled product form on the admin's machine.
 *
 * Losing twenty minutes of typing to an accidental refresh is the single most
 * annoying thing about a long form, so every keystroke is mirrored to
 * localStorage and offered back next time the page opens.
 */

const KEY = 'snackhub_admin_product_draft';

export type ProductDraft = {
  /** Null when adding, the product id when editing an existing one. */
  editingId: number | null;
  savedAt: string;
  form: Record<string, unknown>;
};

export function saveDraft(editingId: number | null, form: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const draft: ProductDraft = { editingId, savedAt: new Date().toISOString(), form };
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Quota exceeded — base64 uploads are large. The form still works, it just
    // will not survive a refresh.
  }
}

export function readDraft(): ProductDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.form ? (parsed as ProductDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/** True when the draft holds anything worth offering back. */
export function draftHasContent(draft: ProductDraft | null): boolean {
  if (!draft) return false;
  const f = draft.form as { name?: string; desc?: string; images?: unknown[]; price?: number };
  return Boolean(
    (f.name && String(f.name).trim()) ||
    (f.desc && String(f.desc).trim()) ||
    (Array.isArray(f.images) && f.images.length > 0) ||
    (typeof f.price === 'number' && f.price > 0)
  );
}
