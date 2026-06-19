# Module 48 - Research-Inspired UI System & Interaction Upgrade

## Purpose

Module 48 applies a scoped, research-inspired UI system pass across MenuDIGI with shared components first. The goal is better consistency, clearer feedback, stronger mobile behavior, and safer accessible patterns without rebuilding working flows or copying external designs.

## Inspiration Sources Reviewed

- Stripe-style design-system consistency: predictable component states, accessible labels, disciplined spacing, and clear destructive actions.
- Vercel-style dashboard navigation: compact shell controls, clear command palette behavior, and fast route jumping that does not imply backend search.
- Dribbble QR menu and restaurant ordering patterns: large mobile tap targets, visible cart/status, and simple ordering steps.
- NN/g visibility of system status heuristic: connected/reconnecting/offline/loading/empty/error states should be visible and text-based.
- Restaurant POS patterns: dense but readable operations screens, obvious next actions, and status-first cards.

No external layouts, screenshots, text, logos, brand assets, or icons were copied.

## Features Audited

- Marketing/auth: landing, login, register, and reset-password limitation messaging.
- Admin shell: sidebar, navbar, command palette, language toggle, realtime badge, notification placeholder, and user controls.
- Dashboard: KPI cards, setup checklist, needs attention areas, quick actions, charts, and recent orders.
- Catalog: products, categories, branches, tables/QR, shops, print stations, settings, and product options JSON workflow.
- Operations: orders, kitchen, payments, realtime status, order drawers, and payment drawers.
- Business: reports, cash ledger, invoices, expenses, shifts, daily closing, staff, and settings.
- Customer QR: menu, product detail, sticky cart, cart, checkout, payment, order success/status, offline/PWA prompts.

## Shared UI Improvements

- `AppButton` now has more consistent press states, motion-reduction support, no-wrap button labels, and stronger active/hover behavior across variants.
- `AppCard` header actions wrap more safely on mobile and card headings use more stable line height.
- `AppEmptyState` now exposes a named checklist region for practical next steps and uses a slightly clearer visual anchor.
- `AppPageHeader` avoids negative tracking, improves heading line height, and gives action groups safer mobile wrapping.
- `AppMetricCard` supports a compact status label so operational cards can show state without relying only on color.
- CRUD form controls now share a consistent control class, stronger disabled/focus states, better line height for Khmer text, and clearer upload hover/focus behavior.

## Landing Improvements

Landing already had the Module 44/46 premium hero, phone mockup, dashboard preview, trust points, sections, pricing, FAQ, and final CTA. This module protects those patterns through shared button/card typography and motion consistency rather than restyling the page again.

## Auth Improvements

Auth pages inherit stronger button, card, and form-control states. Reset/forgot password remains honest: no backend reset flow is faked.

## Admin Shell Improvements

- Command palette dialog now includes an accessible description tied to the footer copy.
- Command palette action rows get clearer active/focus feedback and preserve route-jump-only behavior.
- Realtime badge keeps text-based status and adds a subtle reconnecting pulse for visibility of system status.

## Dashboard Improvements

Dashboard KPI and summary cards inherit improved metric/card/button behavior. `AppMetricCard` status support is available for future live/period labels without adding visual clutter.

## CRUD Improvements

Products, categories, branches, shops, print stations, settings, and tables continue using list-first CRUD and drawers. Shared button, card, form, empty-state, and page-header refinements improve drawer consistency, no-results clarity, and mobile wrapping without reintroducing two-column CRUD.

## Product Options Improvements

The existing backend-compatible JSON helper remains the safe product-options path. The visual option builder remains a TODO until the backend payload contract can be expanded without regression risk.

## Operations Improvements

Orders, kitchen, payments, and realtime surfaces inherit stronger status visibility, button feedback, and card rhythm. No realtime events were faked and no Echo/Pusher import strategy was changed.

## Reports Improvements

Reports keep lazy chart loading and existing analytics payload behavior. Shared card/page-header changes improve chart panel readability and filter wrapping without loading charts into public or landing bundles.

## Customer QR Improvements

Customer QR flows inherit stronger shared button behavior and reduced-motion-safe transitions. Cart visibility, offline submit blocking, payment proof handling, and public menu caching behavior were preserved.

## Feedback Improvements

- Buttons now provide clearer loading/pressed/disabled states.
- Empty-state checklists are announced as suggested next steps.
- Realtime reconnecting state has visual feedback plus text and tooltip copy.
- Existing Sonner/SweetAlert2 boundaries remain unchanged.

## i18n Improvements

No backend product names were translated. Existing Khmer/English copy remains protected through line-height and wrapping improvements in shared controls and cards.

## Accessibility Fixes

- Command palette has dialog title plus description.
- Empty-state checklists expose an accessible list name.
- Form labels keep helper/error text associations and improved line height.
- Realtime badge remains `role="status"` with `aria-live="polite"`.
- Buttons and command actions keep visible focus rings and reduced-motion support.

## Mobile QA Fixes

- Card headers now stack actions instead of squeezing labels.
- Page-header actions use full-width wrapping on narrow screens.
- Form controls and upload inputs have better line height for long Khmer labels.
- Buttons avoid awkward label wrapping while remaining flexible in grouped controls.

## Performance Protection

- No new UI libraries were added.
- Route lazy loading, manual chunks, lazy charts, dynamic realtime code, dynamic SweetAlert2, PWA/offline behavior, and Playwright/Vitest separation were preserved.
- Production build completed without a large chunk warning.

## Tests Added Or Updated

- Updated `AppEmptyState` test to assert the suggested next-steps list.
- Updated `AppMetricCard` test to assert the new compact status label.
- Existing command palette, realtime badge, drawer, form control, public cart/menu, reports, and auth tests remain in the suite.

## Manual Routes To Review

- `/`
- `/login`
- `/register`
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/branches`
- `/admin/tables`
- `/admin/orders`
- `/admin/payments`
- `/admin/kitchen`
- `/admin/reports`
- `/admin/shops`
- `/admin/print-stations`
- `/admin/settings`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

Review at 375px, 430px, 768px, 1024px, and 1440px.

## Known Limitations And TODOs

- This pass intentionally avoids broad page rewrites because recent modules already upgraded many feature surfaces.
- Product options remain JSON-based until a backend-compatible visual builder can be implemented safely.
- Manual browser visual QA is still recommended for every listed route and width.
- Remote GitHub Actions are not claimed unless checked separately.
