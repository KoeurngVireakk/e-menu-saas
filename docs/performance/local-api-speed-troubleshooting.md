# Local API Speed Troubleshooting Guide

This guide describes how to identify, debug, and fix slow API response times in your local development environment for MenuDIGI.

## 1. Verify the displayed duration

### Symptoms
`php artisan serve` prints request durations near 500 ms, 1 s, or 2 s, while `X-Request-Time-Ms` is much lower.

### Root Cause
Laravel's `ServeCommand` polls its child process every 500 ms. The console duration is calculated while those output lines are consumed, so the displayed value is quantized and is not a reliable HTTP benchmark on Windows. Measure wall time with curl and compare it with Laravel's timing header:

```powershell
curl.exe -s -D - -o NUL -w "total=%{time_total}s`n" http://127.0.0.1:8000/api/health/live
```

The timing header starts after Laravel has booted. A low `X-Request-Time-Ms` with high curl wall time points to PHP bootstrap/runtime overhead rather than the controller query.

### Fix
Still use direct IPv4 addresses locally so database and generated API URLs do not depend on hostname resolution:

```ini
DB_HOST=127.0.0.1
APP_URL=http://127.0.0.1:8000
```

## 2. Enable PHP OPcache

On the tested Windows PHP 8.4 installation, OPcache was present at `ext/php_opcache.dll` but disabled in `C:\php-8.4.12\php.ini`. Eight warm health requests averaged 285.6 ms without OPcache and 43.6 ms with it.

Enable these local-development settings in the PHP configuration reported by `php --ini`:

```ini
zend_extension=opcache
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=1
opcache.revalidate_freq=0
```

Restart `php artisan serve` after saving `php.ini`, then confirm `Zend OPcache` appears in `php -v` and `php -m`.

---

## 3. API Response Timing Diagnostics

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

## 4. Laravel Optimization Caching

If changes to configuration, routes, or settings are not reflecting, or if you need to clear compiled views and cache:

```bash
php artisan optimize:clear
```

*Note: `php artisan serve` is only meant for single-developer local testing. For production-like concurrency and latency validation, use a dedicated server setup like Nginx + PHP-FPM or Docker.*

---

## 5. Frontend Deduplication with React Query

In development, React's `StrictMode` mounts components twice, which can duplicate initial queries if they are fetched directly in raw `useEffect` hooks. 

To prevent redundant network requests and avoid concurrent loading bottlenecks:
- Use shared hooks `useShopsQuery` and `useBranchesQuery`.
- These hooks share a query cache with a `staleTime` of 60 seconds.
- Avoid unnecessary `window.setTimeout(load, 0)` delay loops in page-load effects unless strictly required for lifecycle synchronization.
