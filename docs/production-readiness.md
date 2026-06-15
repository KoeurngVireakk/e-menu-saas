# Production Readiness

This checklist is for the E-Menu SaaS React frontend and Laravel API before production release.

## PWA Checks

- Run `npm run build` from `frontend`.
- Confirm these files exist in `frontend/dist`:
  - `manifest.webmanifest`
  - `sw.js`
  - `workbox-*.js`
- Open the production preview with `npm run preview`.
- Visit `/manifest.webmanifest` and `/sw.js`; both should return `200`.
- In Chrome DevTools Application tab, verify:
  - Manifest name is `E-Menu SaaS`.
  - Display mode is `standalone`.
  - Icons are present.
  - Service worker is registered and activated.
- Replace placeholder PWA icons before launch:
  - `frontend/public/pwa-192x192.png`
  - `frontend/public/pwa-512x512.png`

## Offline Checks

- Open a public menu online, for example `/menu/demo-cafe`.
- Add a product to cart while online.
- Enable offline mode in DevTools.
- Reload the same public menu.
- Expected result with cached menu: cached menu appears with an offline warning.
- Expected result without cached menu: clear offline error state appears.
- Cart should still show localStorage items.
- Order submit must be blocked while offline.
- Payment submit must be blocked while offline.
- Admin pages should not expose cached private API data.

## Lighthouse Checks

- Test a production build, not the Vite dev server.
- Run:
  - Mobile Performance
  - Accessibility
  - Best Practices
  - SEO
  - PWA
- Test at least:
  - `/menu/demo-cafe`
  - `/cart`
  - `/login`
- Watch for:
  - Missing accessible names.
  - Low contrast text.
  - Oversized images.
  - Slow API response impact.
  - Service worker or manifest warnings.

## Cache Clearing Steps

- In Chrome DevTools Application tab:
  - Service Workers: unregister old service worker.
  - Storage: clear site data.
  - Cache Storage: delete old Workbox caches.
- Hard reload after clearing.
- When changing service worker rules, close all open tabs for the site before retesting.

## Deployment Checklist

- Set production frontend env values.
- Build frontend with `npm run build`.
- Serve `frontend/dist` from HTTPS.
- Confirm Laravel API CORS allows the production frontend origin.
- Confirm storage URLs are HTTPS.
- Confirm `php artisan storage:link` exists on the server for payment proof/public assets.
- Verify public menu, cart, order submit, payment submit, and admin login.
- Verify service worker update prompt appears after deploying a changed build.
- Review `docs/observability.md` before launch and confirm logs do not contain secrets, tokens, passwords, or payment proof file payloads.

## Environment Variable Checklist

Frontend:

- `VITE_API_URL`
- `VITE_STORAGE_URL`

Backend:

- `APP_URL`
- `FRONTEND_URL`
- `SANCTUM_STATEFUL_DOMAINS` if Sanctum stateful auth is used.
- `SESSION_DOMAIN` if cookie auth crosses subdomains.
- `CORS_ALLOWED_ORIGINS` or equivalent CORS config.
- Database credentials.
- Mail/payment provider credentials if enabled.

Do not commit real secrets.

## Security Header Checklist

- `Strict-Transport-Security` for HTTPS deployments.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` unless embedding is required.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` to restrict unused browser APIs.
- `Content-Security-Policy` tuned for the API/storage domains.
- `Cache-Control` rules that prevent private/admin API caching.

## Cache Header Guidance

- Hashed static assets: `Cache-Control: public, max-age=31536000, immutable`.
- `index.html`: `Cache-Control: no-cache`.
- `sw.js`: `Cache-Control: no-cache`.
- `manifest.webmanifest`: `Cache-Control: no-cache` or short cache.
- Admin/private API responses: `Cache-Control: no-store`.
- Payment proof upload endpoints: `Cache-Control: no-store`.
- Public menu API: network-first service worker strategy with limited fallback cache.

## Nginx Example

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location = /index.html {
    add_header Cache-Control "no-cache";
}

location = /sw.js {
    add_header Cache-Control "no-cache";
}

location = /manifest.webmanifest {
    add_header Cache-Control "no-cache";
}

location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

For Laravel API responses, set private/admin/payment endpoints to `Cache-Control: no-store`.

## Apache Example

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

<FilesMatch "^index\.html$|^sw\.js$|^manifest\.webmanifest$">
  Header set Cache-Control "no-cache"
</FilesMatch>

<FilesMatch "\.(js|css|png|svg|ico)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

Adjust cache matching if filenames are not hashed.
