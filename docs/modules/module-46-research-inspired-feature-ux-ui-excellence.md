# Module 46 - Research-Inspired Feature UX/UI Excellence

## Purpose

This research-inspired Module 46 pass applies external UX principles to MenuDIGI without copying layouts, screenshots, text, brand assets, icons, or interaction details from other products. The goal is a more consistent restaurant SaaS: premium admin surfaces, fast QR ordering, clear setup guidance, safer operations, bilingual copy, and protected performance.

## Sources Reviewed

- Shopify Polaris empty-state guidance: empty states should explain what happened and provide a clear next step for merchants.
- Stripe app design guidance: embedded business tools should feel predictable, focused, and consistent inside dashboard workflows.
- Vercel dashboard navigation changelogs: product navigation benefits from persistent side navigation, prioritized workflows, mobile-aware access, and command-style shortcuts.
- Tablekard-style QR ordering patterns: scan, order, and pay should be framed as a short browser-based flow with no app-download friction.
- Square QR ordering patterns: each QR code should map clearly to a physical table or ordering location, and ordering/payment should feel app-like on mobile.
- Real QR menu feedback from public articles and discussions: customers dislike tiny PDF-like menus, slow loads, unclear payment, phone friction, and inaccessible small-screen experiences.
- Dribbble/Behance dashboard and QR-menu galleries were treated only as visual mood references for spacing, hierarchy, and card density. No screens or assets were copied.

## Research Principles Applied

- Keep the first screen obvious: what the product is, who it serves, what is happening now, and what action is next.
- Keep merchant empty states actionable, especially for shop setup, products, table QR codes, orders, payments, and reports.
- Keep QR ordering mobile-native instead of PDF-like: readable cards, visible cart, table context, simple options, clear payment, and no forced app download.
- Keep operations state-first: order, kitchen, payment, and realtime surfaces should reveal status and next action before secondary detail.
- Keep dashboard panels accessible and named so screen-reader users can scan KPIs, charts, recent orders, and reports with the same clarity as visual users.

## Features Audited

- Public/marketing: landing hero, CTA hierarchy, mockups, pricing placeholder, FAQ, final CTA, mobile copy.
- Auth: login, register, password visibility, validation messaging, reset-password limitation, logout confirmation.
- Admin shell: sidebar grouping, active states, navbar context, command palette trigger, realtime badge, language toggle, notification placeholder, account area.
- Owner setup: setup checklist, dashboard onboarding, shop/profile guidance, branch/category/product/table QR readiness.
- Dashboard: KPI cards, needs-attention panel, setup checklist placement, recent orders, charts, analytics teaser, quick actions, shops.
- Catalog: products, categories, branches, tables/QR, product option JSON workflow.
- Operations: orders, kitchen cards, payment proof review, status actions, realtime states, order/payment drawers.
- Business: reports, cash ledger, invoices, expenses, staff, settings, system health.
- Customer QR: public menu, category tabs, product sheet, cart, checkout, payment, order success/status, offline/PWA prompts.
- Testing/QA: PHPUnit, Vitest, Playwright separation, visual QA, production build chunking.

## Design-System Improvements

- `AppCard` panels can now opt into accessible names and descriptions when titles/descriptions should become region labels.
- Untitled `AppCard` panels can receive an explicit `ariaLabel` for tool panels and compact repeated regions.
- `AppMetricCard` now labels KPI cards by metric title, associates the supporting description, and uses tabular numeric rendering for steadier dashboard scanning.
- These improvements build on the existing shared `AppSheet`, form-control, empty-state, and table semantics from the broader Module 46 pass.

## Landing Improvements

The landing page was audited against the research principles. Existing copy already explains QR menus, ordering, kitchen operations, and payments; no new landing code was needed in this pass. Future review should focus on real merchant proof once legitimate testimonials, pricing, and production screenshots exist.

## Auth Improvements

Login and register were audited for mobile spacing, password visibility, loading state, validation copy, and bilingual labels. Existing auth UX already matches this pass. Reset password remains honestly limited until backend endpoints exist.

## Admin Shell Improvements

The current sidebar, navbar, command palette, realtime badge, language toggle, and notification placeholder remain aligned with the research goal: fast navigation without implying backend search or fake notifications. The shared card/KPI semantics improve the admin surfaces hosted inside the shell.

## Dashboard Improvements

- KPI cards now have accessible panel labels and descriptions.
- Dashboard numeric values use tabular rendering for more stable scanning.
- Existing dashboard structure still answers: what happened today, what needs attention, and what should I do next.
- Recharts remains lazy-loaded in admin-only chunks.

## CRUD Improvements

CRUD surfaces benefit from existing drawer, form, table, and empty-state improvements. This pass did not change CRUD payloads or API behavior. Product options remain backend-compatible JSON with validation and a copyable example.

## Operations Improvements

Orders, kitchen, payments, and realtime surfaces were audited for state clarity and action visibility. No realtime or backend event behavior was changed. Existing status badges, payment proof review, and kitchen/order actions remain protected.

## Reports Improvements

Report cards and charts keep their existing layout and descriptions. Existing no-data states, chart descriptions, filter bar, export action, and lazy chart loading remain intact.

## Customer QR Improvements

Customer QR ordering was reviewed against common QR-menu complaints: slow PDF-like menus, hidden cart state, tiny text, app-download friction, and confusing payment. Existing mobile-first product cards, sticky cart, offline blocking, payment proof preview, and order status timeline remain protected.

## Alert And Feedback Improvements

Existing Sonner and SweetAlert2 boundaries remain unchanged: normal feedback goes through toast channels, while destructive or important confirmations stay behind confirmation helpers. No fake success/realtime messages were added.

## Khmer/English i18n Improvements

Existing bilingual copy was reviewed across shared states, public ordering, reports, command palette, realtime, and product option guidance. This pass did not translate backend-provided names or introduce awkward direct translations.

## Animation And Transitions

Existing framer-motion transitions remain short and nonessential. No new heavy motion was added.

## Accessibility Fixes

- Added opt-in accessible names/descriptions for shared cards without colliding with same-named form fields.
- Added accessible names/descriptions for KPI cards.
- Preserved existing drawer title linkage, focus restoration, form validation relationships, table labels, and command palette accessibility.

## Mobile QA Fixes

No mobile layout code was changed in this pass. The audit keeps the existing priority: large QR-menu tap targets, visible cart state, mobile-safe drawer footers, readable Khmer wrapping, and no horizontal overflow.

## Performance Protection

- No new UI libraries were added.
- Route lazy loading remains unchanged.
- Chart chunks remain lazy/admin-only.
- Echo/Pusher and SweetAlert2 remain out of landing/public first-load paths.
- Vitest remains separated from Playwright E2E files.

## Tests Added

- `AppCard.test.jsx`: titled and explicitly labelled panel semantics.
- `AppMetricCard.test.jsx`: KPI title/description accessibility.

## Manual Review Checklist

- `/`, `/login`, `/register`
- `/admin`, `/admin/products`, `/admin/categories`, `/admin/branches`, `/admin/tables`
- `/admin/orders`, `/admin/payments`, `/admin/kitchen`, `/admin/reports`, `/admin/settings`
- `/admin/cash-ledger`, `/admin/invoices`, `/admin/expenses`, `/admin/staff`, `/admin/system-health` where permissions allow
- `/menu/:shopSlug`, `/cart`, `/payment/:orderNumber`, `/order-success/:orderNumber`
- Widths: 375px, 430px, 768px, 1024px, 1440px

## Known Limitations And TODOs

- Remote GitHub Actions are not claimed unless checked separately.
- Visual product option builder remains a future backend-compatible enhancement.
- Full page-local admin CRUD i18n remains a future pass.
- Real merchant proof, screenshots, pricing, and testimonials should be added only when production-ready and accurate.
