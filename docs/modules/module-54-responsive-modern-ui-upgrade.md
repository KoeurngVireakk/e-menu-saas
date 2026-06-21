# Module 54 — Responsive Modern UI Upgrade

## Purpose

Module 54 hardens MenuDIGI's modern interface across 375px, 430px, 768px, 1024px, and 1440px layouts. It is a frontend-only responsive polish pass: backend contracts, permissions, routes, realtime behavior, QR ordering, payments, reporting, PWA behavior, and test-runner separation remain unchanged.

## Inspiration and principles

Vercel navigation, Shopify Polaris empty states, Material responsive layout guidance, premium SaaS dashboards, and restaurant ordering interfaces informed hierarchy and breakpoint behavior only. No external design, text, assets, icons, or branding were copied.

The implementation favors shared-component fixes, 44px controls, content wrapping, safe internal scrolling, full-width mobile actions, localized horizontal table scrolling, device safe-area support, and restrained motion.

## Responsive improvements

- **Landing:** Existing stacked mobile CTAs, bounded phone/dashboard previews, responsive feature/pricing grids, and reduced-motion behavior were audited and retained. Charts remain outside the landing bundle.
- **Auth:** Existing centered responsive cards, full-width submit controls, large password controls, and Khmer-safe labels were verified.
- **Sidebar and navbar:** Desktop sidebar scrolling remains isolated. The 375–430px navbar now reserves space for the title, hides nonessential notification chrome at the narrowest width, and constrains profile/notification popovers to the viewport.
- **Dashboard and operations:** Existing breakpoint-driven KPI/section grids and operation cards remain intact. Shared buttons, tables, toolbars, modals, and drawers now provide the responsive behavior used by these pages.
- **CRUD modals:** Dynamic viewport height, overscroll protection, single-column content, internal body scrolling, sticky footer, and full-width mobile Save/Cancel actions are enforced centrally.
- **Reports:** Responsive filter/KPI/chart grids and retained-data refresh behavior remain intact. Shared tables now scroll within an accessible, width-bounded region.
- **Customer QR ordering:** Product-detail and cart action bars stack on narrow screens, remain easy to tap, and account for bottom safe-area insets. Modal content uses safe dynamic viewport bounds.
- **Loading, empty, and error states:** Empty-state actions stack and expand on mobile; copy retains a bounded readable measure. Existing section skeletons, retry behavior, and retained refresh data remain unchanged.
- **Khmer typography:** Layouts continue to wrap long Khmer labels rather than shrinking them. Existing Khmer body, heading, label, and button line-height helpers remain active.
- **API perceived speed:** Existing data remains visible during report refetches, loading buttons prevent duplicate submission, and section-level retry/loading patterns remain preserved.

## Tests

Tests cover the responsive navbar container and bounded popovers, dynamic-height CRUD modal, full-width mobile empty-state and checkout actions, accessible table scrolling, existing landing CTAs, sidebar scrolling, Khmer switching, public payment/cart behavior, and Vitest's explicit exclusion of Playwright E2E files.

## Known limitations and TODOs

- Automated DOM tests verify structure and critical responsive classes; final visual checks still require real browser widths and Khmer font rendering.
- Optional Playwright coverage should be run when the local browser environment is available and stable.
- Dense domain tables remain horizontally scrollable on small screens; feature-specific card views can be added later where user research shows they materially improve scanning.
