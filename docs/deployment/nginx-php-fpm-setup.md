# Nginx And PHP-FPM Setup

## Nginx

Use `deploy/nginx/menudigi.conf.example` as a starting point. Replace:

- `__DOMAIN__`
- `__FRONTEND_ROOT__`
- `__BACKEND_PUBLIC__`
- `__PHP_FPM_SOCKET__`
- `__REVERB_UPSTREAM__`

The example supports:

- Vite frontend static assets.
- Laravel API and Sanctum routes through PHP-FPM.
- Public upload serving from Laravel storage.
- Static asset cache headers.
- WebSocket proxying for Reverb.
- Security headers compatible with the Laravel middleware.
- Upload body size suitable for payment proof images.

## HTTPS

Create a separate TLS-enabled server block or enable the commented TLS lines after certificates exist. Use HSTS only after HTTPS is verified end-to-end.

## Reverb Proxy

The example proxies `/api/app/` to the Reverb upstream. Adjust the path if your Reverb client configuration uses another app path.

## PHP-FPM

Use `deploy/php/php-fpm-production.ini.example` as a PHP override template.

Recommended production behavior:

- `display_errors=Off`
- OPcache enabled.
- Upload and post limits aligned with Laravel validation.
- `memory_limit=256M` as a starting point.
- `max_execution_time=60` for normal API requests.

## Validation

Run:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl reload php8.4-fpm
cd backend
php artisan menudigi:production-check --expect-production
```

## Troubleshooting

- 404 on SPA routes: verify `try_files $uri $uri/ /index.html`.
- 404 on API routes: verify backend `public` root and FastCGI script filename.
- 413 uploads: increase `client_max_body_size`, `upload_max_filesize`, and `post_max_size` together.
- WebSocket failures: verify proxy upgrade headers, Reverb host/port, and firewall rules.
