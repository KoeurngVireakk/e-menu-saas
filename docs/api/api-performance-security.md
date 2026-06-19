# MenuDIGI API Performance And Security

## API Performance Principles

- Keep endpoints tenant-scoped before loading relationships.
- Bound operational lists with `per_page`, a maximum of 100, and pagination metadata.
- Use SQL counts and sums for summaries instead of loading full collections into memory.
- Eager-load relationships that the frontend actually renders to avoid N+1 queries.
- Return explicit public payloads for customer-facing APIs and avoid raw Eloquent models on public routes.
- Preserve frontend-compatible response shapes when optimizing existing endpoints.

## Axios Client Rules

- Use the shared `frontend/src/api/axios.js` instance for API calls.
- Prefer `VITE_API_BASE_URL`; `VITE_API_URL` remains a legacy fallback.
- Default timeout is 10 seconds.
- Requests send `Accept: application/json` and `X-Requested-With: XMLHttpRequest`.
- Bearer tokens come only from the current auth token storage and no API keys or provider secrets are attached.
- Responses normalize errors into safe user-facing messages and hide stack-like or SQL-like server details.
- Use `AbortController` and `withAbortSignal` when a component can cancel stale requests on unmount or search changes.

## React Query Caching Rules

- Default stale time is 30 seconds.
- Default garbage-collection time is 5 minutes.
- Window-focus refetching is disabled by default.
- Reconnect refetching remains enabled.
- 4xx responses are not retried; transient/network/5xx failures retry once.
- Mutations do not retry automatically.
- Do not cache sensitive payment proof images or provider secrets in React Query.

## Backend Response Shape Rules

- Authenticated list endpoints should include arrays under their existing keys plus pagination metadata.
- Public endpoints should use explicit DTO-style arrays.
- Public order status must not expose customer phone/name, payment proof paths, provider payment IDs, or provider secret data.
- Admin endpoints may include operational details needed by the UI, but should remain tenant-scoped and permission-checked.

## Pagination Standards

- `per_page` defaults to 50 and is capped at 100 through shared controller helpers.
- Pagination metadata includes `current_page`, `per_page`, `total`, `last_page`, `from`, `to`, and `has_more_pages`.
- Current bounded endpoints: `/api/orders` and `/api/payments`.
- Existing `data.orders` and `data.payments` arrays are preserved for frontend compatibility.

## Cache Strategy

- Public menu backend caching is available through `PublicMenuCacheService`.
- Public menu keys are scoped by shop id, shop cache version, branch id, table code, and locale.
- `PUBLIC_MENU_CACHE_TTL_SECONDS` controls the TTL and defaults to 60 seconds.
- Public menu invalidation increments a per-shop version key after branch, category, product, table, translation, and shop settings updates.
- Cache tags are intentionally avoided so the strategy works with database, file, and array cache drivers.
- Payment proof data, public order status data, provider payloads, and private admin data are not cached.
- PWA/offline public menu cache remains untouched.

## Index Strategy

Composite indexes were added for common scoped filters:

- `orders`: shop, branch, order status, payment status, created time.
- `payments`: shop, branch, status, payment method, created time.
- `products`: shop, branch, category, status, availability.
- `categories`: shop, branch, status, sort order.
- `dining_tables`: shop, branch, status.
- `shop_staff`: user, shop, branch, status.

## Rate Limit Strategy

- Existing route groups are preserved:
  - `auth` for login/register.
  - `public-menu` for QR menu and public product reads.
  - `public-orders` for order create/status.
  - `payment-proof` for proof upload.
  - `admin-api` for authenticated admin APIs.
  - `webhooks` for Bakong KHQR callbacks.
- No unsafe CORS or throttle relaxation was added.

## Safe Error Response Rules

- Laravel API exceptions render JSON.
- Validation errors keep field-level messages.
- Auth and authorization errors return stable safe messages.
- Production 5xx responses avoid raw exception messages.
- Frontend Axios also filters stack-like, SQL-like, and overly long server messages.

## Slow Request Logging

- `API_SLOW_LOG_MS` controls server-side slow API logging.
- Default threshold is `500`.
- Logs include method, route, status, duration, and user id when authenticated.
- Logs do not include request bodies, headers, tokens, uploaded files, proof paths, provider payloads, or secrets.

## Endpoints Reviewed

- Public menu and product reads.
- Public order create, status, and payment proof submit.
- Admin orders and payments.
- Reports and analytics service surface.
- Auth/me and token-based frontend client flow.
- Existing CI-sensitive operational readiness and Vitest/Playwright separation.

## Benchmark And Measurement Notes

- Public menu response size was not measured in this module.
- API call count was not measured with browser tracing in this module.
- Production build chunk status was checked through `npm run build`; no large chunk warning was present.
