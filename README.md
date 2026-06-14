# E-Menu SaaS

QR-based digital menu platform for restaurants, cafés, clubs, and shops.

## Tech Stack

- Laravel API
- React
- Tailwind CSS
- MySQL
- SweetAlert2
- jQuery
- DataTables

## Project Structure

- backend: Laravel API
- frontend: React customer/admin UI
- docs: project documents

## Local Setup

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
cd frontend
npm run build
npm run preview
```

## PWA Setup

The frontend uses `vite-plugin-pwa` to generate the web app manifest and service worker during `npm run build`.

Manifest values:

- App name: `E-Menu SaaS`
- Short name: `E-Menu`
- Display: `standalone`
- Theme color: `#f97316`
- Background color: `#f8fafc`

Current install icons are placeholder files:

- `frontend/public/pwa-192x192.png`
- `frontend/public/pwa-512x512.png`

Before production launch, replace them with branded maskable PNG icons in the same sizes.

## PWA Cache Strategy

- Static frontend build assets are precached for fast repeat loading.
- Public menu API requests use network-first caching with a short timeout and a one-day cache limit.
- Other API requests are network-only.
- Authenticated admin API responses are not cached.
- Payment proof uploads and payment/admin data are not cached.
- The app shell fallback is enabled for public/customer routes only; admin direct offline navigation is not treated as an offline app shell.

## Offline Testing

1. Run `npm run build && npm run preview` from `frontend`.
2. Open a public menu online, for example `/menu/demo-cafe`.
3. In browser DevTools, enable offline mode.
4. Reload the public menu.
5. If the menu was loaded before, the page shows the cached menu with an offline warning.
6. If no cached menu exists, the page shows an offline empty/error state.
7. Cart items remain in localStorage.
8. Order and payment submission are blocked while offline.

Important: after changing service worker or cache rules, close existing tabs or unregister the old service worker in DevTools before retesting.
