# Module 34.5 - Premium MenuDIGI Landing Page

## Purpose

Module 34.5 adds and refines the premium public marketing landing page for MenuDIGI. The fix pass upgrades the visual quality, adds a Tailwind-only iPhone-style product mockup, and introduces a lightweight Khmer/English language foundation for the frontend.

## Reference Inspiration

The structure was inspired by common SaaS landing page patterns, including the requested readmenu.site reference structure. The implementation uses original MenuDIGI copy, layout, mockups, and visual direction. No ReadMenu text, branding, images, or exact layout were copied.

## Sections Added

- Sticky glass landing navbar with language toggle
- Premium hero with bilingual headline, CTAs, trust points, phone mockup, and dashboard mockup
- Product foundation / trust cards
- Feature grid
- How it works
- Payment-ready Cambodia workflow section
- Live demo/product preview
- Pricing placeholder
- FAQ
- Final CTA
- Footer

## UX Problem Fixed

The first landing page version was functional but too plain for a premium SaaS product. The redesign improves hierarchy, spacing, visual depth, product storytelling, mobile polish, animation, and bilingual readiness.

## Route Changes

- `/` now renders the new landing page.
- `/admin` remains protected and unchanged.
- `/login` and `/register` remain public.
- `/menu/:shopSlug`, `/cart`, `/payment/:orderNumber`, and `/order-success/:orderNumber` remain unchanged.

## Design Choices

- White and slate SaaS surface system.
- MenuDIGI blue primary CTA color.
- Dark navy headings and muted slate body text.
- Pure Tailwind/React iPhone-style phone and dashboard mockups, with no external images or Apple assets.
- Honest product-oriented stats instead of fake customer metrics.
- Pricing is intentionally marked as placeholder copy until business terms are finalized.
- Khmer-capable font fallback: `Inter, "Noto Sans Khmer", system-ui, sans-serif`.

## iPhone-Style Mockup Details

The hero phone mockup is built only with React and Tailwind CSS shapes:

- Large rounded smartphone frame
- Thin dark bezel
- Dynamic-island style top cutout
- Soft blue glow and shadow
- Floating motion
- Internal MenuDIGI demo cafe preview
- QR table badge
- Category tabs
- Product cards
- Cart summary
- Order status preview
- KHQR / ABA-ready payment badge
- Live order updates badge

No official Apple images, device files, or copyrighted assets are used.

## i18n Architecture

The frontend now includes a lightweight internal i18n foundation:

- `frontend/src/i18n/translations.js`
- `frontend/src/i18n/LanguageProvider.jsx`
- `frontend/src/i18n/useLanguage.js`
- `frontend/src/i18n/languageContext.js`
- `frontend/src/i18n/index.js`
- `frontend/src/components/common/LanguageToggle.jsx`

Language state:

- Supported languages: `en`, `km`
- Storage key: `menudigi_language`
- Defaults to `en`
- Also syncs with the existing public menu locale storage so current customer menu labels keep working.

Use `const { t } = useLanguage()` and dot keys such as `t("landing.headline")` or `t("common.orders")`.

## Pages Currently Integrated

- Landing page is fully bilingual.
- Landing navbar/footer include the language toggle.
- Admin navbar includes the language toggle and common translated labels.
- Sidebar labels use i18n keys while preserving permission filtering.
- Public menu layout includes the language toggle.
- Login and register include the language toggle and common auth labels.

TODO: Gradually migrate deeper admin page-specific form labels and table columns to i18n in future modules.

## Animation Rules

- Framer Motion section reveal and hero mockup movement.
- Subtle card hover lift.
- Short transitions with ease-out timing.
- No excessive or distracting animation.
- Mockups are decorative and not required to understand the page.
- Reduced-motion preference is respected for core reveal/floating animation paths.

## Accessibility Checklist

- Navigation links are keyboard accessible.
- Mobile menu button includes an `aria-label`.
- Language toggle buttons include accessible labels and pressed state.
- CTA links use readable text.
- Section headings are meaningful.
- FAQ uses native `details` / `summary`.
- Mockups are presented as supporting visuals, with core content available as text.
- Color choices retain high contrast on white and slate surfaces.
- Khmer text renders through the global Khmer-capable fallback stack.

## Manual Routes To Review

- `/`
- `/login`
- `/register`
- `/admin`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

## Known Limitations / TODOs

- Remote GitHub Actions status should be checked separately when `gh` or web access is available.
- Pricing must be finalized before production sales launch.
- Live preview currently links to account creation rather than a guaranteed seeded public demo menu.
- Legal footer links/pages still need final policy content.
- Noto Sans Khmer is referenced as a font fallback but is not imported from Google Fonts yet.
- Page-specific admin labels still need gradual i18n migration.
