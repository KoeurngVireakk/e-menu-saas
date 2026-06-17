# Module 36 - Dribbble-Inspired Premium UX/UI System Polish

## Purpose

Module 36 applies a premium SaaS visual pass to MenuDIGI while keeping the product practical for restaurant operations. Dribbble dashboard searches were used only as broad visual inspiration for spacing, surfaces, hierarchy, and micro-interactions. No external layouts, images, brand assets, or copy were reproduced.

## What Was Improved

- Shared UI primitives now use MenuDIGI blue focus states, rounded-2xl/rounded-3xl surfaces, subtle shadows, cleaner field spacing, and stronger loading/empty/error states.
- Auth pages now use a premium split-card layout with MenuDIGI branding, Khmer/English language toggle, password visibility controls, loading buttons, and mobile-friendly spacing.
- Customer ordering surfaces received a lighter premium polish for product cards, product detail sheets, option controls, and sticky cart summary behavior.
- Realtime status copy was standardized around clear operational labels.

## Landing Improvements

The landing page already contains the Module 34.5 premium hero, Tailwind phone mockup, dashboard mockup, pricing cards, FAQ, final CTA, and bilingual language switch. Module 36 preserves that production-ready landing experience and aligns shared primitives used around it.

## Auth Improvements

- Login and registration screens use MenuDIGI logo placement, blue CTAs, soft slate backgrounds, and readable form controls.
- Password fields include accessible show/hide buttons.
- Form controls use visible focus rings and consistent touch targets.

## Admin Shell Improvements

The existing shell already includes a grouped sidebar, active pill states, navbar language toggle, realtime status badge, notification placeholder, and logout confirmation. Module 36 keeps these behaviors and improves shared primitives used by admin drawers and forms.

## CRUD Improvements

- Inputs, selects, textareas, cards, modals, and drawers now share the same MenuDIGI visual language.
- Modal headers and footers are sticky, making create/edit workflows easier on mobile.
- Validation/error states are clearer and use text, not only color.

## Realtime UX Improvements

Realtime labels are now:

- Live updates on
- Connecting live updates...
- Live updates paused
- Realtime connection issue

No fake realtime events were added.

## Public Customer UX Improvements

- Product cards have better shadows, hover/tap affordance, image placeholders, and add-button sizing.
- Product detail sheets have a more polished mobile drawer surface and clearer option controls.
- Sticky cart summary now appears as a floating mobile-first action surface.

## i18n Improvements

The existing language toggle remains available on landing, auth, admin shell, and customer menu surfaces. Khmer text uses the existing global font stack:

`Inter, "Noto Sans Khmer", ui-sans-serif, system-ui, sans-serif`

Backend product translations remain controlled by the localization API and are not faked in the frontend.

## Animation Rules

- Use subtle 150ms-400ms transitions.
- Prefer ease-out and small elevation/opacity changes.
- Avoid excessive motion in tables and operational screens.
- Do not make motion required to understand state.

## Accessibility Checklist

- Icon buttons added in auth forms include aria-label text.
- Modals keep dialog roles and accessible labels.
- Realtime status is text-based.
- Form focus states are visible.
- Loading, empty, and error states include readable text.
- Payment/order/customer flows were not changed at the API level.

## Manual Routes To Review

- `/`
- `/login`
- `/register`
- `/admin`
- `/admin/categories`
- `/admin/products`
- `/admin/orders`
- `/admin/payments`
- `/admin/kitchen`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

Review at 375px, 430px, 768px, 1024px, and 1440px.

## Known Limitations / TODOs

- This is a safe polish pass, not a full redesign of every admin page.
- Forgot/reset password screens were not changed because the project does not expose a confirmed reset-password frontend flow in the inspected routes.
- Remote GitHub Actions status must be checked separately after pushing; local checks are the source of truth for this module.
