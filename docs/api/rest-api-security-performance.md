# REST API Security And Performance Standards

## Response Standards

- Return stable JSON with `success`, `message`, and `data` or `errors`.
- Use 401 for unauthenticated requests, 403 for forbidden tenant/action access, 404 for missing resources, 422 for validation errors, and 429 for throttling.
- Public endpoints must return explicit arrays or resources, not raw owner/staff/user internals.
- Public order status must not expose customer phone, customer name, payment proof paths, provider payment IDs, or provider secrets.

## Axios Client Standards

- All frontend API calls should use `frontend/src/api/axios.js`.
- Base URL comes from `VITE_API_BASE_URL`, with `VITE_API_URL` retained as a fallback.
- Timeout is 10 seconds.
- Requests send `Accept: application/json` and `X-Requested-With: XMLHttpRequest`.
- Bearer tokens are attached only from the existing auth token storage.
- Use `createAbortController()`, `withAbortSignal()`, and `isRequestCanceled()` for cancellable reads.
- UI code should use normalized `{ status, message, errors, code, isCanceled }` error data and avoid showing raw stack-like server messages.

## React Query Strategy

- Default stale time is 30 seconds.
- Default garbage collection time is 5 minutes.
- 4xx responses do not retry.
- transient/network/5xx responses retry once.
- Window-focus refetch is disabled by default; reconnect refetch is enabled.
- Do not cache payment proof files or provider secrets.

## Pagination And Filtering

- Admin list endpoints should support `page`, `per_page`, and relevant filter fields.
- `per_page` should default to 15 or 50 depending on the workflow and be capped at 100.
- Preserve existing frontend array keys when adding pagination metadata.
- Pagination metadata should include `current_page`, `per_page`, `total`, `last_page`, `from`, `to`, and `has_more_pages`.

## Public Menu Cache Strategy

- Cache only public menu payloads that are safe for customer QR rendering.
- Key by shop id, cache version, branch id, table code, and locale.
- Default TTL is controlled by `PUBLIC_MENU_CACHE_TTL_SECONDS`.
- Invalidate by incrementing the shop version after branch, category, product, table, translation, and shop profile/settings changes.
- Do not use cache tags unless the configured cache driver supports them in all deployment targets.
- Do not cache payment proof data, customer order details, provider payloads, or private staff/admin data.

## Database Index Strategy

- Composite indexes should follow tenant scope first, then common filters, then sort columns.
- Current API performance indexes cover orders, payments, products, categories, dining tables, and shop staff.
- Avoid duplicate indexes and keep SQLite test compatibility in mind when adding migrations.

## Slow Request Logging

- `API_SLOW_LOG_MS` controls server-side slow API logging.
- Logs include method, route, status, duration, and authenticated user id when available.
- Logs must not include request bodies, headers, tokens, uploaded files, payment proofs, provider payloads, or secrets.
- `API_TIMING_HEADERS` is opt-in and should be used only for local/testing diagnostics.

## Security Rules

- Keep authenticated endpoints behind `auth:sanctum` and appropriate throttles.
- Preserve tenant and branch authorization checks before returning data.
- Keep public payloads minimal and explicit.
- Return safe production 5xx messages.
- Do not relax CORS or rate limits for perceived speed.
