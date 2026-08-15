import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The admin panel is a handful of logged-in staff on office connections,
    // and its images are 40-60px previews of base64 blobs and arbitrary
    // pasted URLs. next/image would add a per-image optimisation cost for
    // thumbnails nobody's Core Web Vitals depend on. The storefront, which
    // shoppers actually load, still has the rule enforced.
    files: ["app/admin/**"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    // One-off maintenance scripts run by hand with node, not part of the app
    // bundle and never imported by it.
    files: ["*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
