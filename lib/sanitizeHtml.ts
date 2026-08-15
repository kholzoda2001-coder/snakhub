import sanitize from 'sanitize-html';

/**
 * Two places render HTML that came out of the database: the editable pages
 * (About / Privacy / Terms) and the banner headline. Both are written by the
 * admin, so this is not about distrusting the shop owner — it is about what one
 * stolen admin password is worth. Without this, an attacker who gets into the
 * admin panel once can leave a <script> in the Terms page that runs in every
 * customer's browser from then on, including on the checkout page, and removing
 * their access afterwards would not remove the script.
 *
 * An allowlist, not a blocklist: anything not named here is dropped, so a tag or
 * attribute nobody thought of does not get through by default.
 */

/** Rich text for the admin-editable pages: enough to write a Terms page with. */
const PAGE_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'div', 'span',
    'strong', 'b', 'em', 'i', 'u', 's', 'small', 'sub', 'sup',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    // Class is allowed so the page can use the shop's existing styles; `style`
    // is not, because it is how an injected element gets positioned invisibly
    // over the checkout button.
    '*': ['class'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  // Anything else — javascript:, data:, vbscript: — is stripped with the
  // attribute. This is what stops <a href="javascript:...">.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  // No <iframe> host allowlist: the tag is not in allowedTags at all.
  allowedIframeHostnames: [],
  transformTags: {
    // A link that opens a new tab hands that tab a window.opener reference to
    // the shop unless it is severed here.
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target
        ? { ...attribs, rel: 'noopener noreferrer' }
        : attribs,
    }),
  },
};

/** Banner headlines are one line of text — bold and italics, nothing else. */
const INLINE_OPTIONS: sanitize.IOptions = {
  allowedTags: ['strong', 'b', 'em', 'i', 'br', 'span'],
  allowedAttributes: { '*': ['class'] },
  allowedSchemes: [],
};

export function sanitizePageHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitize(html, PAGE_OPTIONS);
}

export function sanitizeInlineHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitize(html, INLINE_OPTIONS);
}
