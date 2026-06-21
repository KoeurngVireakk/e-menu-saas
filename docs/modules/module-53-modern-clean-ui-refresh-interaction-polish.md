# Module 53 — Modern Clean UI Refresh and Interaction Polish

## Purpose and principles

Module 53 is a focused cleanup of the established MenuDIGI interface rather than a redesign. It reduces visual noise, strengthens hierarchy, normalizes interaction feedback, improves mobile behavior, and protects Khmer readability. Vercel navigation, Shopify Polaris empty-state guidance, Stripe consistency, premium SaaS dashboards, and restaurant QR/POS products informed principles only; no external layouts, copy, screenshots, assets, icons, or colors were copied.

The working principles are restrained color, useful whitespace, consistent 44px controls, visible focus, one clear primary action, soft borders and shadows, short transitions, truthful state messaging, and mobile-first customer ordering.

## Global UI system

- Primary, secondary, danger, success, outline, and ghost controls now use quieter shadows and consistent 200ms press/hover behavior.
- Buttons permit natural multiline Khmer labels instead of forcing nowrap.
- Inputs and selects have a consistent 44px minimum height; textareas use a readable minimum height and remain vertically resizable.
- Hover, focus, disabled, and invalid states remain distinct without excessive movement.
- Cards remove redundant white rings and use a restrained shadow. Shared card headings, descriptions, metrics, and table headings use Khmer typography helpers.
- Base modal dialogs now lock body scroll, restore focus, expose a labeled dialog, support Escape/backdrop close, and use a compact accessible icon close action.
- Centered CRUD busy-state protections from Module 52 remain intact.

## Landing and authentication

The landing page retains its clean bilingual CTA hierarchy, QR customer phone, honest operations preview, feature grid, four rollout steps, pricing disclosure, FAQ, and final CTA. It contains no Recharts import, testimonials, copyrighted imagery, or invented customer metrics.

Login and registration now use focused centered cards rather than decorative split panels. Brand, language toggle, labels, password visibility, honest unavailable-reset guidance, loading state, validation feedback, and mobile spacing remain visible with less competing content.

## Admin shell and dashboard

The permission-aware desktop sidebar keeps independent vertical scrolling and the mobile off-canvas navigation introduced in Module 52. Navbar route context, command trigger, language, realtime, honest notification placeholder, and account/logout behavior remain preserved.

Dashboard structure continues to answer what happened, what needs attention, and what to do next using real loaded data. Its failure state now provides a direct retry action rather than a terminal message. KPI, checklist, quick-action, recent-order, payment, kitchen, and report sections retain their existing data contracts.

## CRUD and operations

Products, categories, branches, tables/QR, shops, staff, print stations, expenses, shifts, kitchen stations, and translations continue to use centered forms. Sticky footer hierarchy, scrollable bodies, mobile near-full-screen sizing, validation, busy states, and safe Escape behavior are preserved. Order detail and payment proof review remain drawers because those workflows benefit from operational context.

The shared button/card/table refresh improves scanability and mobile action targets across orders, kitchen, payments, proof review, and status actions without changing permissions, realtime claims, or API mutations.

## Reports

Reports retain lazy admin-only charts, descriptions, summaries, export authorization, and tenant-scoped data. The filter layout now uses fewer, wider columns. Existing report data stays visible during background refresh while a compact status explains that fresh data is loading. First load still uses a skeleton and failures retain retry.

## Customer QR ordering

The customer menu keeps its shop/table context, sticky categories, product cards, required-option validation, safe-area cart bar, checkout, offline blocking, payment proof preview, order timeline, and install/update behavior. Product detail status and preparation labels now follow the selected locale, quantity controls have localized accessible names, and shared controls provide cleaner press/focus feedback.

## Khmer, states, feedback, and perceived speed

- The Inter, Khmer OS Battambang, Noto Sans Khmer stack and Khmer line-height/uppercase/tracking rules remain global.
- Shared controls now allow Khmer labels to wrap and breathe.
- Loading, empty, no-results, offline, timeout, and error/retry states remain explicit and avoid raw server details.
- Buttons disable duplicate submits and expose busy state. Existing save/delete/order/payment toasts and confirmations remain connected to real actions.
- Reports keep previous data during refresh; React Query continues to retain cached shared data. This module does not alter backend performance or business logic.

## Tests and limitations

Coverage includes shared control states, Khmer button wrapping, base/CRUD modal accessibility, auth controls, landing CTAs and Khmer switching, sidebar/navigation behavior, centered CRUD entry points, dashboard/reports, operations drawers, public menu/cart, timeout feedback, and Vitest/Playwright separation.

Known limitations:

- Some legacy operational strings still need incremental dictionary migration.
- Password reset remains honest messaging until a backend endpoint exists.
- Pricing remains rollout placeholder content pending commercial decisions.
- Visual review is still required with representative Khmer catalog data at 375, 430, 768, 1024, and 1440px.
- Existing historical stashes are intentionally untouched.

