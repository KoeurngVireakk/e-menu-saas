# API Speed, Security, and Axios Optimization

## Root cause findings

The repeated ~500 ms durations are not caused by controller sleeps or the slow-request middleware. With `API_TIMING_HEADERS=true`, sequential requests to `GET /api/health/live` spent about 12 ms inside Laravel while wall-clock requests through the Windows PHP development server took approximately 257–355 ms. Laravel's `ServeCommand` polls child-process output every 500 ms, so its printed request durations are quantized and should not be treated as HTTP measurements. Page-level duplicate requests amplify the single-worker transport cost.

The installed PHP runtime included OPcache but had it disabled. A controlled eight-request warm benchmark averaged 285.6 ms without OPcache and 43.6 ms with OPcache. Enable OPcache in the loaded `php.ini` for the largest local bootstrap improvement.

Use a production-style local server (Laravel Octane, FrankenPHP, nginx/Apache with PHP-FPM, or a container matching production) when evaluating concurrency. `php artisan serve` remains suitable for basic development but is not a concurrency benchmark.

## Artificial delay audit

No artificial 500 ms backend or frontend runtime delay was found. The request logger measures elapsed time after the downstream response returns and never sleeps. Remaining timers are UI focus, transient notification, print, audio cleanup, or intentional operations polling behavior; none impose a 500 ms API response delay.

## Duplicate frontend calls

Before this pass, admin pages independently loaded `/shops`, shop branches, categories, products, orders, and payments. React StrictMode could execute mount effects twice in development, and route changes discarded page-local results.

The frontend now uses React Query for shared resources. `AuthContext` is the only current-user owner and consumes `useCurrentUser`; multiple StrictMode consumers share one `['auth', 'me']` request. Admin pages share shops and branches instead of issuing page-local requests. Dashboard and Orders share the same unfiltered order cache, and mutations invalidate their resource key.

Stable keys are:

- `['auth', 'me']`
- `['shops']`
- `['shops', shopId, 'branches']`
- `['shops', shopId, 'categories']`
- `['shops', shopId, 'products', filters]`
- `['orders', filters]`
- `['payments', filters]`

Filter objects are normalized by removing empty values and sorting keys.

## Axios and React Query

The single Axios client uses `VITE_API_BASE_URL` (with the existing compatibility fallback), a 10-second timeout, an `Accept: application/json` default, conditional bearer authentication, AbortSignal request cancellation, safe error normalization, cancellation detection, and one interceptor registration path. Axios derives request content types from submitted bodies, avoiding unnecessary global preflight-triggering headers. UI errors do not expose stack traces, SQL details, or raw exception paths.

React Query defaults retain data for 30 seconds, garbage collect after five minutes, keep previous data, avoid focus refetches, refetch after reconnect, and retry safe transient failures once. It does not retry 401, 403, 404, or 422 responses (or other 4xx responses).

## Backend queries, indexes, and cache

Orders and payments already paginate and eager-load their required relationships. Tenant and branch authorization remains applied before results are returned. The performance migration covers the requested composite order, payment, product, category, dining-table, and staff access paths and now also adds `branches_shop_status_idx`; no duplicate index was added.

The public menu uses a short tenant-, branch-, table-, locale-, and version-scoped cache. Product, category, branch, table, translation, and relevant settings writes increment the shop cache version. The implementation avoids cache tags and does not cache payment proofs, credentials, or private order payloads. Authenticated shop data is primarily deduplicated in the browser cache; server caching was not added because authorization membership changes require broader invalidation guarantees.

## Timing and security diagnostics

`LogSlowApiRequests` logs method, route template, status, duration, and user id only. It does not log bodies, headers, files, tokens, or secrets. `X-Request-Time-Ms` is opt-in and intended for local/testing. A regression test calls the middleware directly and asserts it adds no material delay.

Public menu responses continue to use explicit allowlisted arrays. Tenant-scope, public-payload, pagination, cache invalidation, health, timing, Axios, cancellation, query defaults, shared-query deduplication, and Vitest/Playwright separation are covered by the existing and added tests.

## Before/after observations

- Direct local health check: Laravel processing about 12 ms versus 257–355 ms wall time through the existing Windows development server.
- Controlled PHP runtime benchmark: 285.6 ms average without OPcache versus 43.6 ms with OPcache.
- Before: page-local mount effects repeatedly fetched shared shop/branch data and could duplicate under StrictMode.
- After: the StrictMode shared-current-user test renders two consumers and observes exactly one `/auth/me` call.
- After: `/shops` and branch reads have one canonical hook and cache key across admin pages.
- After: Dashboard, Orders, Payments, Products, Categories, and Shops retain previous cached data during background refreshes.

## Known limitations and TODOs

- Authenticated endpoint wall-clock measurements require a valid local session and representative data; automated feature tests cover `/api/auth/me`, `/api/shops`, `/api/orders`, shop products, and shop categories without publishing credentials.
- Operations pages intentionally poll where realtime delivery is not sufficient. Polling is centralized per mounted query but is not removed.
- Public product detail and authenticated report summaries can be evaluated for short caching after mutation invalidation rules are defined.
- Re-run browser-network waterfall capture against a production-style local server with representative tenant data for a numerical page-load comparison.
