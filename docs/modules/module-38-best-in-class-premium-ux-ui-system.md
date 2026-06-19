# Module 38 - Best-in-Class Premium UX/UI System Upgrade

## Status

Module 38 focuses on practical premium UX polish across MenuDIGI without replacing working flows or faking unavailable backend features.

## Inspiration Sources

- Premium SaaS dashboard patterns: dense but readable navigation, clear action hierarchy, and state-first dashboards.
- Vercel and Linear-style productivity patterns: sticky shell, fast navigation affordances, compact controls, and consistent focus states.
- Stripe and Shopify Polaris principles: accessible labels, predictable CRUD workflows, helpful empty states, and cautious destructive actions.
- Restaurant QR ordering/POS patterns: mobile-first product cards, visible cart state, kitchen/payment status clarity, and simple table workflows.

No external layouts, screenshots, logos, or copyrighted assets were copied.

## Design Principles

- State -> problem -> next action on operational screens.
- Customer QR ordering stays mobile-first with large tap targets and visible cart status.
- CRUD remains list-first with drawer-based create/edit workflows.
- Realtime UI is honest: connected, connecting, paused, and issue states are visible.
- Khmer and English labels come from the i18n layer where practical.
- Motion is short, useful, and nonessential.

## Global Visual Improvements

- Added reusable app state aliases for loading, empty, error, no-results, offline, forbidden, and success states.
- Improved error states with icon support and clearer hierarchy.
- Kept the light SaaS palette: blue primary, slate text, white cards, thin borders, and soft shadows.
- Preserved existing route-level lazy loading and manual chunk protections.

## Landing Improvements

- Existing landing already includes sticky navbar, language toggle, premium hero, CSS phone mockup, dashboard mockup, feature grid, QR ordering flow, payment-ready section, timeline, pricing, FAQ, CTA, and footer.
- Existing framer-motion reveal/floating/stagger patterns were retained.
- Pricing remains marked as a planning placeholder until production pricing is finalized.

## Auth Improvements

- Login/register use premium split-card layouts with logo, language toggle, password visibility, loading buttons, and mobile-friendly spacing.
- Auth labels now use shared translation keys for email/password/confirm password.
- Reset password is documented as unavailable because no backend endpoint currently exists. The UI does not pretend reset works.
- Logout confirmation now uses translated confirmation copy.

## Sidebar and Navbar Improvements

- Sidebar groups align to requested IA: Overview, Operations, Catalog, Business, Settings.
- Existing routes and permission checks were preserved.
- Navbar now shows contextual page title and operational eyebrow based on the current admin path.
- Navbar includes an accessible workspace search/jump placeholder without pretending to perform backend search.
- Realtime status, language toggle, notification placeholder, and logout confirmation remain visible in the admin shell.

## Dashboard Improvements

- Existing dashboard already acts as a control tower with KPI cards, charts, recent orders, quick actions, shops, and realtime hooks.
- Realtime labels are now bilingual through the shared i18n layer.
- Existing chart chunks remain lazy-loaded.

## CRUD Improvements

- Existing CRUD drawers remain list-first and drawer-based.
- Drawer component now exposes `role="dialog"` and `aria-modal="true"` with title labeling.
- Added a drawer accessibility regression test.
- Existing CRUD toolbar, row actions, status tabs, skeletons, toasts, and confirmations remain in place.

## Alerts and Feedback

- Sonner remains the normal toast channel.
- SweetAlert2 remains reserved for destructive or important confirmations.
- Logout confirmation copy is now translatable.
- Existing offline and PWA banners remain in the public shell.

## Realtime Improvements

- `RealtimeStatusBadge` now supports translated state labels:
  - Connecting live updates...
  - Live updates on
  - Live updates paused
  - Realtime connection issue
- It does not import Echo/Pusher and does not fake realtime.
- It remains safe to render outside a language provider, falling back to English.

## Public Customer Menu Improvements

- Existing public shell includes language toggle, network banner, mobile-first layout, sticky cart bar, public empty states, product detail sheet, cart, payment, and order success/status routes.
- Offline warnings remain visible through PWA/network components.
- Customer pages continue to avoid admin-style tables.

## i18n Improvements

Added missing English/Khmer keys for:

- Common actions: create, update, close, clear filters, no results, view details.
- Auth: login/register/logout/reset-related labels and logout confirmation.
- Navbar/sidebar group labels and workspace context.
- Public ordering labels: add to cart, quantity, order now, payment method, proof upload, order success/status, offline message.
- Realtime labels: connected, connecting, disconnected, error, new order, payment confirmed.

Backend product names are not translated unless backend translations exist.

## Animation Rules

- Keep motion in the 150ms-400ms range for interactions.
- Use ease-out transitions and avoid excessive bounce.
- Existing framer-motion route, card, landing, and sticky cart transitions were preserved.
- Realtime and public ordering do not require animation to understand state.

## Accessibility Checklist

- Icon buttons have accessible names where used in edited components.
- Language toggle remains keyboard accessible and uses `aria-pressed`.
- Realtime status uses text, not color alone, and announces updates politely.
- Drawers now expose dialog/modal semantics.
- Navbar search placeholder has an accessible label.
- Focus rings remain visible on shell controls.
- Khmer text uses the app typography stack.

## Performance Protection Notes

- Route lazy loading remains intact.
- Recharts stays lazy-loaded inside dashboard chart components.
- Echo/Pusher are not imported into landing or public menu bundles.
- SweetAlert2 remains behind the existing alert helper usage and is not added to public landing code.
- Existing Vite manual chunks were not changed.

## Manual Review Routes

- `/`
- `/login`
- `/register`
- `/admin`
- `/admin/categories`
- `/admin/products`
- `/admin/orders`
- `/admin/payments`
- `/admin/kitchen`
- `/admin/settings`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

Review at 375px, 430px, 768px, 1024px, and 1440px.

## Known Limitations and TODOs

- Forgot/reset password requires backend endpoints before production UI can enable the workflow.
- Navbar search is a safe placeholder for future command/search routing. It does not claim backend search.
- Notification bell remains a placeholder until notification inbox APIs exist.
- Pricing copy is a planning placeholder and must be finalized before commercial launch.
- Remote GitHub Actions are not claimed unless checked separately.
