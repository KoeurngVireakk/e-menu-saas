# Local API Speed Troubleshooting Guide

This guide describes how to identify, debug, and fix slow API response times in your local development environment for MenuDIGI.

## 1. Local Database Connection Delay (Windows DNS Resolution)

### Symptoms
Local API requests take ~500ms (e.g., `/api/auth/me` ~510ms, `/api/shops` ~504ms), while duplicate preflight calls (OPTIONS) take ~0.1ms.

### Root Cause
When running local MySQL on Windows, using `DB_HOST=localhost` in your `.env` file forces PHP to attempt an IPv6 DNS lookup for `localhost` before failing back to IPv4 (`127.0.0.1`). On Windows, this lookup can time out or delay for exactly 500ms per database connection instantiation.

### Fix
Update your backend `.env` file to use the direct IPv4 loopback address instead of `localhost`:

```ini
DB_HOST=127.0.0.1
```

---

## 2. API Response Timing Diagnostics

To verify whether a slow response is caused by PHP processing time or external network delays, you can enable the `X-Request-Time-Ms` response header.

### Enable Diagnostics
Add the following key to your backend `.env` file:

```ini
API_TIMING_HEADERS=true
```

When enabled, all `/api/*` responses will include the `X-Request-Time-Ms` header indicating the time in milliseconds spent inside the Laravel application routing and middleware stack.

> [!WARNING]
> Keep `API_TIMING_HEADERS=false` (default) in production to avoid exposing application performance metrics.

---

## 3. Laravel Optimization Caching

If changes to configuration, routes, or settings are not reflecting, or if you need to clear compiled views and cache:

```bash
php artisan optimize:clear
```

*Note: `php artisan serve` is only meant for single-developer local testing. For production-like concurrency and latency validation, use a dedicated server setup like Nginx + PHP-FPM or Docker.*

---

## 4. Frontend Deduplication with React Query

In development, React's `StrictMode` mounts components twice, which can duplicate initial queries if they are fetched directly in raw `useEffect` hooks. 

To prevent redundant network requests and avoid concurrent loading bottlenecks:
- Use shared hooks `useShopsQuery` and `useBranchesQuery`.
- These hooks share a query cache with a `staleTime` of 60 seconds.
- Avoid unnecessary `window.setTimeout(load, 0)` delay loops in page-load effects unless strictly required for lifecycle synchronization.
