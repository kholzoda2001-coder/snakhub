import type { NextConfig } from "next";
// JSON, not a .ts module: at dev startup Next compiles this config to
// next.config.compiled.js in the project root and `require`s its imports from
// there, so a TypeScript import would fail to resolve and the dev server would
// not boot. lib/imageHosts.ts reads the same file.
import imageHosts from "./image-hosts.json";

// Type errors used to be ignored here, which let real bugs reach production.
// If a build fails, fix the error rather than re-adding ignoreBuildErrors.
const nextConfig: NextConfig = {
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
