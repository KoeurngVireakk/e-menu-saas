# Module 34.5 - Premium MenuDIGI Landing Page

## Purpose

Module 34.5 adds a premium public marketing landing page for MenuDIGI before the next PWA-focused module. The page introduces MenuDIGI as a QR menu, ordering, kitchen operations, and payment workflow platform for Cambodian restaurants, cafes, marts, and food businesses.

## Reference Inspiration

The structure was inspired by common SaaS landing page patterns, including the requested readmenu.site reference structure. The implementation uses original MenuDIGI copy, layout, mockups, and visual direction. No ReadMenu text, branding, images, or exact layout were copied.

## Sections Added

- Sticky landing navbar
- Hero with product headline, CTAs, trust points, phone mockup, and dashboard mockup
- Product foundation / trust cards
- Cambodia payment support section
- Feature grid
- Platform showcase
- How it works
- Live preview
- Pricing placeholder
- Designed-for business cards instead of fake testimonials
- FAQ
- Final CTA
- Footer

## Route Changes

- `/` now renders the new landing page.
- `/admin` remains protected and unchanged.
- `/login` and `/register` remain public.
- `/menu/:shopSlug`, `/cart`, `/payment/:orderNumber`, and `/order-success/:orderNumber` remain unchanged.

## Design Choices

- White and slate SaaS surface system.
- MenuDIGI blue primary CTA color.
- Dark navy headings and muted slate body text.
- Pure Tailwind/React phone and dashboard mockups, with no external images.
- Honest product-oriented stats instead of fake customer metrics.
- Generic “Designed for” cards instead of fake testimonials.
- Pricing is intentionally marked as placeholder copy until business terms are finalized.

## Animation Rules

- Framer Motion section reveal and hero mockup movement.
- Subtle card hover lift.
- Short transitions with ease-out timing.
- No excessive or distracting animation.
- Mockups are decorative and not required to understand the page.

## Accessibility Checklist

- Navigation links are keyboard accessible.
- Mobile menu button includes an `aria-label`.
- CTA links use readable text.
- Section headings are meaningful.
- FAQ uses native `details` / `summary`.
- Mockups are presented as supporting visuals, with core content available as text.
- Color choices retain high contrast on white and slate surfaces.

## Manual Routes To Review

- `/`
- `/login`
- `/register`
- `/admin`
- `/menu/:shopSlug`

## Known Limitations / TODOs

- Remote GitHub Actions status should be checked separately when `gh` or web access is available.
- Pricing must be finalized before production sales launch.
- Live preview currently links to account creation rather than a guaranteed seeded public demo menu.
- Legal footer links are placeholders and need final policy pages.
