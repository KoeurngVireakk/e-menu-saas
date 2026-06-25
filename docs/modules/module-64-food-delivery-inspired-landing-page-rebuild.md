# Module 64 - Food Delivery Inspired Premium Landing Page Rebuild

## Scope

Module 64 rebuilds the public landing page into a premium restaurant ordering product story while preserving the existing MenuDIGI design direction, auth routes, public ordering routes, PWA setup, i18n system, and test separation.

The Dribbble food delivery landing page reference was used only for broad visual direction: energetic food-tech composition, strong hero hierarchy, product preview emphasis, rounded surfaces, and app-like mobile ordering cues. No layouts, artwork, copy, or assets were copied.

## Updated Surface

- `frontend/src/pages/landing/LandingPage.jsx`
- `frontend/src/pages/landing/LandingPage.test.jsx`
- `frontend/src/i18n/translations.js`
- `docs/design/ux-ui-quality-checklist.md`

## Landing Structure

- Sticky bilingual navigation with product anchors and auth CTAs.
- Hero section with one clear `h1`, QR ordering value proposition, trust chips, and primary/secondary actions.
- CSS/Tailwind product preview showing a mobile QR menu, cart state, order status, payment proof, kitchen flow, and admin dashboard preview.
- Four-step how-it-works section: build menu, generate QR, customer scans/orders, staff manages orders/payments.
- Bento feature section for QR menu builder, table QR, mobile ordering, cart/checkout, kitchen display, payment proof review, reports, and Khmer/English support.
- Admin preview section that uses clearly labeled product placeholders instead of fake business metrics.
- Customer flow section that explains scan, browse, customize, order, proof upload, and status tracking.
- Payment readiness section that stays honest about cash, manual proof, KHQR-ready workflows, and provider configuration.
- Audience, pricing-planning, FAQ, final CTA, and footer sections.

## UX Improvements

- Replaced the older SaaS-generic landing structure with a food-ordering-first narrative.
- Kept blue/navy brand, white cards, soft slate background, rounded cards, subtle borders, and restrained motion.
- Preserved mobile-first QR ordering details with a reusable phone mockup and sticky-cart-style preview.
- Improved button hierarchy with clear primary registration actions and secondary QR demo anchors.
- Avoided fake realtime, fake provider readiness, fake testimonials, fake customer counts, and fake revenue claims.
- Used CSS/Tailwind decorative food swatches and product previews instead of adding image dependencies or UI libraries.

## Khmer And I18n

- Added landing copy to English and Khmer translation dictionaries for the rebuilt sections.
- Kept Khmer text on `khmer-*` typography classes so it avoids forced uppercase and letter spacing.
- Left demo product names as product-like display data rather than over-translating backend-style catalog names.

## Tests

- Updated landing tests for the rebuilt hero headline, CTAs, navigation, how-it-works, bento features, product preview, FAQ, language switch, and one-body-h1 requirement.

## Known Limitations

- The landing product preview is an illustrative CSS/Tailwind composition, not a live backend dashboard.
- Pricing remains planning copy because production pricing has not been finalized.
- Payment provider readiness is described as workflow readiness and still depends on merchant configuration.
