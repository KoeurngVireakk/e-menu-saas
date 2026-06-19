# Cloudflare And SSL Checklist

## DNS

- Point frontend hostname to the frontend/Nginx server.
- Point API hostname to the backend/Nginx server if split.
- Point WebSocket hostname to the Reverb/Nginx endpoint if split.
- Avoid proxying until origin TLS and health checks are working.

## TLS Modes

- Prefer Full strict mode.
- Use Let's Encrypt or Cloudflare Origin CA on the origin.
- Do not use Flexible mode for authenticated SaaS traffic.

## Nginx Headers

After HTTPS is verified, enable HSTS:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Only enable preload after every subdomain is HTTPS-ready.

## WebSockets

- Ensure Cloudflare proxy supports the WebSocket hostname.
- Confirm Nginx passes `Upgrade` and `Connection` headers.
- Use `wss://` through `VITE_REVERB_SCHEME=https` and port `443`.

## Uploads

- Align Cloudflare upload limits with Nginx and PHP limits.
- Payment proof validation remains enforced by Laravel.

## Security

- Do not expose MySQL, Redis, or PHP-FPM ports publicly.
- Restrict SSH by key and IP where possible.
- Store backend secrets in server secret management, not Git.
- Keep Cloudflare cache rules away from `/api`, `/sanctum`, payment, auth, and admin routes.

## Smoke Tests

- `https://example.com`
- `https://example.com/api/health`
- `https://example.com/api/health/ready`
- Public menu route.
- Login and admin dashboard.
- Reverb connection over WSS.
