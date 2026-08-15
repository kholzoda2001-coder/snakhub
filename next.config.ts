import type { NextConfig } from "next";
// JSON, not a .ts module: at dev startup Next compiles this config to
// next.config.compiled.js in the project root and `require`s its imports from
// there, so a TypeScript import would fail to resolve and the dev server would
// not boot. lib/imageHosts.ts reads the same file.
import imageHosts from "./image-hosts.json";

// Type errors used to be ignored here, which let real bugs reach production.
// If a build fails, fix the error rather than re-adding ignoreBuildErrors.
/**
 * Sent on every response.
 *
 * `script-src` is deliberately absent, and so is `default-src` — setting either
 * without a nonce would block Next's own hydration scripts and the language
 * script in app/layout.tsx, and generating a nonce forces every page to render
 * dynamically, which would throw away the ISR caching that makes the shop fast.
 * The directives below are the ones that cost nothing and still close real
 * attacks: framing, plugin content, <base> hijacking and form exfiltration.
 * Script injection is handled at the source instead, by sanitising the two
 * places that render admin-authored HTML (see lib/sanitizeHtml.ts).
 */
const securityHeaders = [
  // Nobody may frame the shop, so a hidden overlay cannot trick a customer into
  // clicking "Place order". frame-ancestors is the modern form; X-Frame-Options
  // repeats it for older browsers that ignore CSP.
  {
    key: 'Content-Security-Policy',
    value: [
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      // Injected HTML cannot post the checkout form to an attacker's server.
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stops a browser from guessing that an uploaded "image" is really a script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // A customer's order id stays out of the Referer header sent to other sites.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Two years, so the browser refuses plain HTTP to this domain even on the
  // very first request of a session. Only meaningful over HTTPS in production.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // The default `X-Powered-By: Next.js` tells an attacker which framework and
  // therefore which CVEs to try first. It also costs bytes on every response.
  poweredByHeader: false,

  // No Cache-Control entry for /_next/static here: Next already serves those
  // hashed assets as immutable for a year, and overriding it makes the build
  // warn that it breaks dev behaviour.
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  images: {
    // Product photos arrive as 800px+ JPEGs but are shown in ~200px cards, so
    // the optimizer resizes and re-encodes them to AVIF/WebP on the fly.
    formats: ["image/avif", "image/webp"],
    // Base64 product images are served by /api/images/<id>?index=<n>. Declaring
    // an `images` config makes Next reject local query strings by default, and
    // omitting `search` here is what allows the ?index= parameter through.
    localPatterns: [
      { pathname: "/api/images/**" },
      { pathname: "/**" },
    ],
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
