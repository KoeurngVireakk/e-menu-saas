# Module 35 - Mobile PWA & Offline-Friendly Restaurant Ordering UX

## Purpose

Module 35 improves the customer-facing QR menu flow so MenuDIGI feels faster and more app-like on mobile devices. The focus is resilient menu browsing, clear network state, safer offline behavior, and cart persistence without changing backend order or payment APIs.

## PWA Setup

The frontend uses `vite-plugin-pwa` with generated service worker support. The web app manifest is configured in `frontend/vite.config.js` with MenuDIGI branding, standalone display mode, public icons, and a navigation fallback for the landing, auth, public menu, cart, payment, and order-success routes.

Existing icon assets:

- `frontend/public/pwa-192x192.png`
- `frontend/public/pwa-512x512.png`

TODO: Replace placeholder/generic PWA icons with final production MenuDIGI maskable icons when brand assets are finalized.

## Install Prompt Behavior

`frontend/src/components/pwa/InstallAppPrompt.jsx` listens for `beforeinstallprompt`, shows a mobile-friendly install card, and remembers dismissal in localStorage using `menudigi_install_prompt_dismissed`.

The prompt:

- Uses the CTA `Install MenuDIGI`.
- Offers `Maybe later`.
- Avoids showing after dismissal.
- Avoids showing in standalone display mode.
- Keeps the older `emenu_install_prompt_dismissed` key as a compatibility dismissal check.

## Update Prompt Behavior

`frontend/src/components/pwa/AppUpdatePrompt.jsx` uses `virtual:pwa-register` and shows a compact update card when a new service worker version is available.

The prompt:

- Shows `A new version is ready`.
- Offers `Update now` and `Later`.
- Does not block the full page.

## Network Banner Behavior

`frontend/src/components/pwa/NetworkStatusBanner.jsx` detects browser online/offline state through `navigator.onLine` and online/offline window events.

Behavior:

- Offline message: `You're offline. Menu browsing may still work, but ordering needs internet.`
- Back-online message: `Back online.`
- Back-online state clears automatically after a short delay.
- The public customer layout displays the banner across menu, cart, payment, and order-success routes.

## Menu Cache Strategy

`frontend/src/services/publicMenuCache.js` stores the last successful public menu response in localStorage.

Cache keys include:

- shop slug
- locale
- branch context
- table context
- search/query context

On successful public menu API load, the response is cached. If the API fails later, MenuPage attempts to use cached data and shows a warning:

`Showing the last saved menu. Prices or availability may have changed.`

Corrupted cache entries are removed safely.

## Cart Persistence Strategy

`frontend/src/utils/cart.js` now supports scoped cart keys:

`menudigi_cart:{shop}:{branch}:{table}`

The old `emenu_cart` key remains as a fallback so existing carts and tests do not break. The cart is saved after add/update/remove, restored on page load, and cleared after successful order submission for the active shop/table context.

## Offline Ordering Policy

MenuDIGI does not queue offline orders in this module. Ordering requires an active internet connection because the backend is the source of truth for pricing, product availability, order totals, and order numbers.

Offline behavior:

- Customers can browse cached menus if available.
- Customers can edit their cart.
- Order submission is disabled offline.
- The UI explains: `Ordering requires internet connection.`

TODO: Add an offline order queue only after backend idempotency, conflict resolution, and sync auditing are designed.

## Payment/Offline Safety

Payment submission is disabled offline. The payment page does not store proof images, provider payloads, or payment data in localStorage.

When offline:

- Payment method inputs are disabled.
- Proof upload is disabled.
- A message explains that payment submission requires internet.

## Order Status Offline Behavior

Order success stores a safe last-known status snapshot without private customer details or payment proof data. If the order status endpoint cannot be reached while offline, the page can show the last known status and tells the customer to reconnect to refresh.

Live order tracking is not shown while offline.

## Accessibility Checklist

- Network banners use `role="status"` and polite live regions.
- Install/update prompts have accessible buttons.
- Offline reasons are visible near disabled checkout/payment actions.
- Product images include alt text and lazy loading.
- Status and warning messages use text, not color alone.

## Manual Test Steps

Review these routes:

- `/`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

Manual cases:

1. Load a public menu online.
2. Refresh the page.
3. Simulate offline mode in browser dev tools.
4. Confirm cached menu appears if available.
5. Confirm checkout is disabled offline.
6. Go back online and confirm the banner changes.
7. Add an item to cart, refresh, and confirm the cart persists.
8. Submit an order online and confirm the scoped cart clears.
9. Test mobile width `375px`.
10. Test tablet width `768px`.

## Known Limitations / TODOs

- No offline order queue is implemented.
- Public menu cache uses localStorage, not IndexedDB.
- Product availability is not deeply reconciled against stale cart items yet.
- Production PWA icon assets should be finalized before launch.
- Remote GitHub Actions status should be checked in GitHub after push.
