# Module 44 - Pixel-Perfect UX/UI QA, Usability Testing & Conversion Polish

## Status

Module 44 applies a focused pixel QA and usability pass across MenuDIGI without rebuilding working flows or adding fake backend behavior.

## Purpose

- Improve conversion clarity on the landing page.
- Tighten customer QR ordering and payment confidence.
- Make staff operations actions easier to scan and tap.
- Extend the design QA checklist for repeatable manual review.

## Screens Audited

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
- `/admin/settings`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

## Landing Improvements

- Hero now includes a clearer audience/value proof line.
- Primary CTA is more specific: create the QR menu.
- Secondary CTA points to the ordering flow.
- Hero background was simplified to a controlled light SaaS band.
- Payment section uses a restrained blue panel instead of a stronger gradient.

## Auth Improvements

- Module 43 auth microcopy remains in place.
- Reset password remains honest because backend reset endpoints do not exist.
- Login/register routes remain unchanged.

## Admin Shell Improvements

- Module 43 command trigger, command palette, realtime status, and notification placeholder remain in place.
- Module 44 extends the QA checklist for navbar crowding, keyboard access, and Khmer review.

## Dashboard Improvements

- Existing control-tower structure remains intact.
- Module 44 review criteria document what the dashboard must answer: what happened, what needs attention, and what to do next.

## CRUD Improvements

- Existing drawer-based CRUD remains intact.
- Module 44 checklist adds pixel/mobile QA rules for drawer footer, form wrapping, helper text, and destructive copy.

## Operations Improvements

- Kitchen order actions now use short, scannable labels: Accept, Preparing, Ready, Complete.
- Kitchen and order detail action groups use responsive grids for better mobile wrapping.
- Payment review drawer now explains when to confirm or reject payment.
- Action groups expose accessible labels for order/payment context.

## Reports Improvements

- Module 43 report empty states, KPI cards, summaries, and chart descriptions remain intact.
- Module 44 checklist adds chart color, mobile layout, filter clarity, and no-data review rules.

## Customer QR Improvements

- Product cards use larger image/tap areas and clearer no-image placeholders.
- Add-to-cart buttons expose product-specific accessible labels.
- Category tabs now expose selected state with `aria-pressed`.
- Payment page copy is localized and clearer about proof review, offline submission, and session-only preview behavior.

## Alert And Feedback Improvements

- Offline payment submission uses localized warning copy.
- Payment success/error messages use public localization.
- Inline required option validation from Module 43 remains in place.

## i18n Improvements

- Added English and Khmer landing conversion copy.
- Added English and Khmer public payment labels, offline warning copy, proof preview alt text, and Bakong KHQR help text.
- Backend product names remain untranslated unless backend translations exist.

## Animation And Micro-Interactions

- Existing page, card, command palette, sticky cart, and product-card motion remain short and nonessential.
- Landing background was simplified to reduce visual noise.
- No new heavy animation library was added.

## Accessibility Fixes

- Category tabs expose `aria-pressed`.
- Product add buttons include product-specific accessible labels.
- Kitchen/order/payment action groups include contextual accessible labels.
- Payment proof preview uses localized alt text.

## Mobile Fixes

- Customer product cards use larger tap targets.
- Kitchen/order/payment action rows wrap through responsive grids.
- QA checklist now includes 375px, 430px, 768px, 1024px, and 1440px review rules.

## Performance Protection

- No new UI library was added.
- Route lazy loading remains unchanged.
- Recharts remains out of landing/public bundles.
- Echo/Pusher and SweetAlert2 import behavior was not changed.
- Production build must remain free of large chunk warnings.

## Tests Added Or Updated

- Landing page CTA/copy expectations.
- Payment page localized copy expectations.
- Sticky cart helper copy expectation.
- Public menu/cart behavior remains covered by existing tests.

## Known Limitations And TODOs

- Manual screenshot comparison was not automated.
- Product options still use the existing backend-compatible model.
- Notification inbox and reset password still require backend APIs.
- Remote GitHub Actions must be checked separately if needed.
