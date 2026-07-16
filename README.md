# Snack Hub

Next.js 16 shop (App Router) + Prisma + MySQL. Everything — storefront, admin
panel and API — lives in this one app.

## Environment variables

Set all of these in `.env` locally **and** in the Vercel project settings.
Without the two `ADMIN_*` ones the admin panel cannot be opened at all.

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | MySQL connection string |
| `ADMIN_PASSWORD` | yes | Password for `/admin/login` |
| `ADMIN_SESSION_SECRET` | yes | Long random string used to sign the admin session cookie |
| `IMGBB_API_KEY` | for image uploads | Server-side key for banner/category uploads |
| `ZIINA_API_KEY` | optional | Fallback if the key is not set in Admin → Settings |

Never prefix a secret with `NEXT_PUBLIC_` — that ships it to every visitor's browser.

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also runs prisma generate)
npx tsc --noEmit # typecheck
```

## How things fit together

- `proxy.ts` — the security gate (Next 16 renamed Middleware to Proxy). It
  protects `/admin/*` and every write endpoint. The storefront, `POST /api/orders`,
  the Ziina webhook and payment verification stay public. Any new admin route is
  protected automatically; any new public one must be added to `isPublicRequest`.
- `lib/pricing.ts` — the only place order money is calculated. The cart and the
  API both call it, so they can never disagree. The API always re-prices from the
  database and ignores prices sent by the browser.
- `lib/catalog.ts` — shop data reads, shared by the API and the server-rendered pages.
- `lib/orders.ts` — stock reservation and the guarded Paid/Failed transitions, so
  one payment can never produce two Telegram messages.
- `lib/ziina.ts` — every payment status is confirmed by asking Ziina directly.
  Webhook payloads are unauthenticated and are never trusted on their own.

## Things worth knowing

- The home page is server-rendered and cached for 60 seconds (`revalidate` in
  `app/page.tsx`), because the database is far from the Vercel region. Admin
  changes appear within a minute.
- Product images may be an external URL or base64. URLs go straight to the
  browser; base64 is served through `/api/images/[id]`. See `lib/productImages.ts`.
- Stock is only enforced when **Admin → Settings → Track stock levels** is on.
  Fill in real stock numbers on every product first, or orders will be rejected.
