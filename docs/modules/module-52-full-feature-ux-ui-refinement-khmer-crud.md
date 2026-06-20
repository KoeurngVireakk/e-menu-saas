# Module 52 — Full Feature UX/UI Refinement, Khmer Typography, and Centered CRUD

## Purpose

Module 52 consolidates MenuDIGI's premium light SaaS presentation, mobile restaurant ordering flow, Khmer readability, state feedback, and centered create/edit standard. Stripe, Vercel, Shopify Polaris, modern POS products, and QR-ordering interfaces informed hierarchy and interaction principles only; no external copy, screenshots, brand assets, or layouts were copied.

## Landing experience

- The sticky bilingual navbar exposes the primary registration action and QR menu demo action.
- The hero identifies the product as QR menu, ordering, and payment software, identifies restaurant roles, and pairs a customer phone preview with an honest operations preview.
- The preview uses order, payment, and kitchen status rows instead of importing or simulating a chart.
- Bento features, four-step rollout, payment readiness, staged pricing, FAQ disclosure controls, and the final CTA remain responsive and free of testimonials or invented customer metrics.

## Admin shell

- The desktop sidebar remains a full-height flex column. Its logo and workspace card do not shrink; navigation owns the vertical scroll area.
- Mobile navigation is a real off-canvas drawer with an accessible navbar trigger, dismiss overlay, close button, route-close behavior, and preserved permission filtering.
- Khmer group labels avoid forced uppercase and tracking through the shared typography rules.
- Navbar context now covers catalog, operations, shops, invoices, expenses, cash ledger, shifts, daily closing, print stations, translations, reports, settings, staff, and system health. It displays a route title, workflow eyebrow, optional wide-screen subtitle, command trigger, honest notification placeholder, language controls, and account/logout menu.

## Centered CRUD and operation forms

`CrudFormModal` provides dialog semantics, labeled title/description, focus restoration, body scroll locking, responsive near-full-screen mobile sizing, sticky save/cancel footer, visible focus states, overlay/Escape dismissal, and a busy state that prevents accidental dismissal during save.

Centered editors cover products, categories, branches, tables, shops, staff, print stations, expenses and expense categories, kitchen stations, translations, and cashier shift workflows. Products use the larger width. Order detail, payment proof review, QR preview, and other complex operational context remain drawers where spatial continuity is more useful.

## Khmer and i18n

- The global stack is `Inter, "Khmer OS Battambang", "Noto Sans Khmer", system-ui, sans-serif`.
- Khmer body, heading, label, button, wrapping, uppercase, and letter-spacing rules are applied from `html[lang="km"]`.
- English and Khmer page-title strategies cover admin and public flows.
- Landing badge, admin mobile navigation, customer product cards, cart summary, and order-success/receipt actions now use bilingual copy. Backend product and category names remain unchanged unless localized backend data exists.

## Loading, error, empty, and perceived speed

- Shared skeleton/loading states prevent blank screens; empty and no-result states explain a next step; errors support retry without exposing raw exception detail.
- Axios now provides an actionable timeout message and continues to avoid global preflight-only headers.
- React Query retains previous data and shared shop/branch/current-user caches. Submit buttons expose busy/disabled states to prevent duplicate writes.
- These feedback improvements are separate from backend/runtime performance measurement.

## Customer QR experience

The public menu retains cached/offline handling, sticky category navigation, large product and add controls, required-option validation, a safe-area-aware cart bar, cart review, offline submit blocking, proof preview, payment guidance, and order timeline. Product-card controls, cart counts, order-success guidance, receipt actions, and payment continuation are readable in English and Khmer.

## Tests

Coverage includes landing CTAs and bilingual switching, sidebar groups/scroll classes, mobile navigation, navbar command context, modal accessibility and busy dismissal protection, centered CRUD entry points including shifts, empty-state actions, public menu/cart behavior, operational drawers, Axios timeout feedback, and Vitest/Playwright separation.

## Known limitations and TODOs

- Pricing is rollout placeholder copy and must be finalized before commercial launch.
- Backend notification search/inbox is not implemented; the UI states that honestly.
- Some legacy admin operational copy still requires incremental migration to shared English/Khmer keys.
- Manual QA remains required at 375, 430, 768, 1024, and 1440 px with representative Khmer catalog content.
- Production-like API concurrency should be measured outside PHP's single-worker development server.

