# Module 47 - API Security, Axios Optimization And Fast Response Performance

## Purpose

Module 47 improves API reliability, frontend request behavior, list endpoint bounds, database query support, and slow-request visibility without changing auth, public ordering, reports, PWA/offline, realtime, or CI workflow boundaries.

## Audit Summary

- Axios had safe error normalization but no explicit timeout and used only `VITE_API_URL`.
- React Query had reasonable defaults but retried client-side 4xx failures.
- `/api/orders` and `/api/payments` returned unbounded collections.
- Order summary counts and revenue were derived from loaded collections.
- Public menu payloads already use explicit DTO-style arrays and avoid raw shop owner/user payloads.
- Public order status already excludes customer private fields and proof/provider secret paths.
- Existing route throttles cover auth, public menu, public orders, payment proof, admin APIs, broadcasts, and webhooks.

## Axios Improvements

- Added `VITE_API_BASE_URL` with legacy `VITE_API_URL` fallback.
- Added a 10 second timeout.
- Ensured JSON and `X-Requested-With` headers are attached consistently.
- Preserved bearer token behavior without attaching secrets.
- Added `withAbortSignal` helper for cancellable requests.
- Hardened error normalization to suppress SQL/stack/vendor-looking messages.

## Query Client Improvements

- Added 5 minute `gcTime`.
- Preserved 30 second default `staleTime`.
- Disabled retries for 4xx responses.
- Limited transient/network/5xx retries to one attempt.
- Kept reconnect refetching enabled and window-focus refetching disabled.

## Backend Response Improvements

- Added shared pagination helpers to the base controller.
- `/api/orders` now returns a bounded `orders` array plus `pagination`.
- `/api/payments` now returns a bounded `payments` array plus `pagination`.
- Empty-access responses include consistent pagination metadata.
- Order summary now uses SQL count/sum queries instead of loading the full result collection.

## Pagination And Filtering Changes

- `per_page` defaults to 50 and is capped at 100.
- `/api/orders` supports `payment_status` filtering in addition to existing shop, branch, status, and date filters.
- `/api/payments` supports status, payment method, and date filters.
- Existing frontend-compatible array keys were preserved.

## Indexes Added

- `orders_api_scope_status_created_idx`
- `payments_api_scope_status_created_idx`
- `products_public_menu_idx`
- `categories_public_menu_idx`
- `dining_tables_scope_status_idx`
- `shop_staff_user_scope_status_idx`

## Caching Changes

No new backend cache was added. Public menu caching remains a future task because correct invalidation needs to cover products, categories, options, translations, shops, branches, and table QR context.

## Public Menu Speed Changes

No public menu response shape was changed. Existing eager loading and explicit public payload shaping were preserved. New product/category/table indexes support public menu and table QR lookups.

## Dashboard And Reports Speed Changes

Dashboard order loading benefits from bounded `/api/orders` and SQL summary aggregation. Reports code was audited but not changed because the current reporting service already aggregates through scoped report endpoints.

## Security Improvements

- Frontend suppresses unsafe server details in normalized errors.
- Order/payment list endpoints remain tenant-scoped before pagination.
- Slow API logging excludes bodies, headers, files, tokens, proof paths, and provider payloads.
- Existing public order/payment payload safety tests remain in place.

## Slow Request Logging

- Added `LogSlowApiRequests` API middleware.
- Added `API_SLOW_LOG_MS=500` to backend env example and config.
- Logs method, route, HTTP status, duration, and authenticated user id only.

## Frontend Perceived Performance

- Axios timeout prevents requests from hanging indefinitely.
- React Query avoids noisy 4xx retries.
- Abort signal helper is available for stale request cancellation.
- Existing skeleton/loading states were preserved.

## Tests Added Or Updated

- Axios tests for base URL, timeout, auth headers, cancellation config, and safe error normalization.
- Query client tests for cache/retry defaults.
- Backend pagination test for orders and payments.

## Benchmark And Measurement Notes

- Public menu response size was not measured.
- Browser API waterfall call counts were not measured.
- Production build was checked and no large chunk warning appeared.

## Known Limitations And TODOs

- Public menu backend caching and invalidation remain TODO.
- More list endpoints can move to server-side pagination in future modules.
- Frontend order/payment pages still apply some filters client-side over the current page; server-side filter wiring is a future UX/API pass.
- Remote GitHub Actions are not claimed unless checked separately.
