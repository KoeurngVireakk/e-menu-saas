# Module 51 - REST API Security & Axios Fast Response Optimization

## Purpose

Module 51 improves REST API safety and perceived response speed without changing public ordering, auth, reports, PWA/offline cache, realtime, or existing frontend route boundaries.

## API Audit Findings

- Axios already used one shared client, token headers, and safe error messages.
- React Query already had bounded retry behavior and avoided focus refetches.
- Orders and payments already use backend pagination metadata.
- Public menu responses already use explicit public arrays instead of raw owner/user models.
- Public menu reads were a good caching target because they are non-sensitive and high traffic.
- Public menu request cancellation was missing on route, locale, branch, and table changes.

## Axios Improvements

- Added first-class `createAbortController()` and `isRequestCanceled()` helpers.
- `normalizeApiError()` now returns `code` and `isCanceled` fields.
- Canceled requests normalize as `ERR_CANCELED` instead of server failures.
- Existing 10 second timeout, JSON headers, token behavior, and safe server-message filtering remain in place.

## React Query Improvements

Existing defaults were preserved:

- `staleTime`: 30 seconds.
- `gcTime`: 5 minutes.
- 4xx errors do not retry.
- transient/network/5xx errors retry once.
- window-focus refetch remains disabled.
- reconnect refetch remains enabled.

## Backend Response Payload Security

- Public menu responses continue to expose only shop, branch, table, category, product, option, and option value fields needed by the customer UI.
- Public table context does not expose `qr_token`.
- Public order status and payment responses remain covered by existing safety tests for private customer/payment fields.

## Query Performance Improvements

- Existing composite indexes from the earlier API performance pass are retained.
- Public menu reads now avoid repeated query work for identical shop, branch, table, and locale combinations during the cache TTL.
- Public menu cache keys are tenant-scoped by shop id.

## Pagination And Filtering

- Orders and payments keep compatible array keys plus pagination metadata.
- Additional list endpoints were not changed in this module to avoid breaking current CRUD assumptions.

## Database Indexes

Existing API performance indexes remain active:

- `orders_api_scope_status_created_idx`
- `payments_api_scope_status_created_idx`
- `products_public_menu_idx`
- `categories_public_menu_idx`
- `dining_tables_scope_status_idx`
- `shop_staff_user_scope_status_idx`

No new index migration was required in Module 51.

## API Caching Changes

- Added `PublicMenuCacheService`.
- Added `PUBLIC_MENU_CACHE_TTL_SECONDS`, defaulting to 60 seconds.
- Public menu cache keys include shop id, cache version, branch id, table code, and locale.
- Cache invalidation increments a per-shop version key rather than relying on cache tags, so database/file/array cache drivers stay portable.
- Invalidated after branch, category, product, table, translation, and shop settings updates.

## Public QR Menu Speed Improvements

- `/api/public/shops/{slug}/menu` now caches safe public menu payloads.
- The frontend public menu request now cancels stale in-flight requests when the route/search/locale context changes.
- The existing local PWA/offline menu cache remains unchanged.

## API Security Hardening

- Public cache stores only public menu payloads, not payment proof or order/customer private data.
- Slow API logs continue to exclude request bodies, headers, tokens, files, and provider payloads.
- Existing route throttles remain unchanged.

## Slow Request Logging

- Existing `LogSlowApiRequests` middleware remains active on API routes.
- `API_SLOW_LOG_MS` controls logging threshold.
- `API_TIMING_HEADERS` remains opt-in for local/testing diagnostics.

## Tests Added Or Updated

- Axios cancellation helper and normalized canceled-error tests.
- Public menu test mock updated for named Axios helpers.
- Backend public menu cache invalidation regression test.

## Measurements

- Production build was checked and had no large chunk warning.
- Public menu payload size and browser waterfall request count were not measured in this module.

## Known Limitations And TODOs

- More admin CRUD endpoints can move to paginated server responses in a future API/UX pass.
- Public menu product detail endpoint is not separately cached.
- Remote GitHub Actions are not claimed unless checked separately.
