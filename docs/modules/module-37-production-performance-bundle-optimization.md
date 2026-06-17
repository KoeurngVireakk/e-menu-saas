# Module 37 - Production Performance & Bundle Optimization

## Purpose

Module 37 reduces MenuDIGI frontend production bundle pressure without changing the visual system or route behavior. The focus is safer first loads for the landing page and QR customer menu, deferred admin-only dependencies, and clearer production chunks for long-term bundle inspection.

## Baseline

Baseline checks were run before edits:

- `backend`: `php artisan test`, `php artisan route:list`
- `frontend`: `npm run lint`, `npm run test`, `npm run build`
- root: `git diff --check`

The baseline frontend build passed but emitted Vite's large chunk warning because `vendor-D2dkamR2.js` was `549.41 kB` minified (`158.33 kB` gzip).

## Optimization Strategy

- Keep existing route-level lazy loading in `src/routes/AppRoutes.jsx`.
- Move global PWA install/update prompts behind `React.lazy` so they do not join the initial app module.
- Lazy-load dashboard chart widgets so Recharts is only requested when chart cards render.
- Dynamically import Echo/Pusher from `src/lib/echo.js` so realtime code is not a static hook dependency.
- Replace broad manual chunk matching with precise package matching in `vite.config.js`.

## Route-Level Splitting

The existing route tree already lazy-loads:

- Landing page
- Auth pages
- Admin pages
- Public menu, cart, payment, and order success pages

Module 37 keeps that structure and improves the route fallback by preserving the existing lightweight `LoadingState` route shell. Admin-only pages remain outside the landing and public menu route chunks.

## Manual Chunks

`vite.config.js` now splits the largest dependency groups into logical production chunks:

- `vendor-react`
- `vendor-router`
- `vendor-query`
- `vendor-tables`
- `vendor-charts`
- `vendor-realtime`
- `vendor-animation`
- `vendor-alerts`
- `vendor-datatables`
- `vendor-http`
- `vendor-icons`
- `vendor-forms`
- `vendor-date`
- `vendor-ui`

The matching is package-specific to avoid grouping unrelated packages such as `lucide-react`, `react-hook-form`, or `@tanstack/react-query` into the React chunk.

## Lazy-Loaded Libraries

- Recharts: dashboard chart components are imported with `React.lazy` and rendered with compact chart skeletons.
- Echo/Pusher: `getEcho()` dynamically imports `laravel-echo` and `pusher-js` only when realtime is configured and used.
- SweetAlert2: already dynamically imported through `src/components/ui/alerts.js`; this API remains unchanged.
- PWA prompts: install and update prompts are lazy-loaded from `src/App.jsx`.

## Public Page Performance

Public menu product images already use `loading="lazy"` and `decoding="async"` with stable image containers. Menu filtering, featured products, cart context, and category counts are memoized in `MenuPage.jsx`. Cart submission still blocks offline ordering, and payment proof previews remain in browser memory through object URLs instead of localStorage.

## Landing Page Performance

The landing page remains route-lazy and uses CSS/Tailwind dashboard and phone mockups rather than chart libraries. No admin chart, table, realtime, or DataTables dependency is required for the landing route.

## PWA And Cache Safety

The service worker keeps a narrow runtime cache:

- Public menu API: `NetworkFirst`, scoped to `/api/public/shops/*/menu`
- Other API routes: `NetworkOnly`
- Navigation fallback: limited to app and public customer routes

Sensitive payment/customer API data is not runtime-cached by Workbox. Public menu localStorage cache remains scoped by shop, branch, table, locale, and search.

## Tests

Added `frontend/src/hooks/useOperationsRealtime.test.jsx` to verify:

- Disabled realtime does not load Echo.
- Unconfigured realtime reports `unavailable` without loading Echo.

Existing alert, public menu, cart, payment, PWA, and admin page tests continue to pass.

## Build Result

After optimization, `npm run build` passes without the Vite large chunk warning. Largest minified JS chunks in the local build:

- `vendor-charts`: `253.59 kB`
- `vendor`: `197.79 kB`
- `vendor-datatables`: `179.43 kB`
- `vendor-react`: `178.35 kB`
- `vendor-animation`: `125.53 kB`

The local build does not include a `vendor-realtime` output because no `VITE_REVERB_APP_KEY` is set, so Vite constant-folds realtime as unavailable. Production builds with a Reverb key will use the dynamic realtime imports and the realtime chunk rule.

## Verification Commands

- `php artisan test`
- `php artisan route:list`
- `npm run lint`
- `npm run test`
- `npm run build`
- `git diff --check`

## Known Limitations And TODOs

- No bundle visualizer dependency was added; the Vite build output was enough to remove the warning safely.
- Recharts remains a large admin-only vendor chunk. Further reductions would require replacing or selectively loading chart primitives.
- Framer Motion is still used by the landing page and shared UI. Reducing it further would require broader UX changes and was intentionally avoided.
