# Module 50 - Khmer-First Premium UI System

## Purpose

Module 50 upgrades MenuDIGI with a Khmer-first typography system and a clearer page title strategy while preserving the premium SaaS, QR ordering, operations, reports, PWA, security, and performance work already in place.

## Suggested Title

Khmer-First Premium UI System & Feature Experience Upgrade

## Inspiration Sources

- Stripe-style design-system consistency and accessibility.
- Vercel-style dashboard navigation clarity.
- Shopify Polaris-style page titles, subtitles, and action guidance.
- Premium dashboard and QR ordering UI patterns used only as inspiration.
- Cambodian Khmer-first typography needs for restaurant owners, staff, kitchen teams, and customers.

No external layouts, screenshots, text, brand assets, icons, colors, or font files were copied.

## Khmer OS Battambang Typography Approach

- Added `Khmer OS Battambang` to the global CSS font stack.
- Kept Inter first for English UI.
- Used the existing `document.documentElement.lang` behavior from `LanguageProvider` to activate Khmer-specific typography rules.
- Added Khmer-friendly utilities:
  - `khmer-text`
  - `khmer-heading`
  - `khmer-label`
  - `khmer-button`
- Applied Khmer utilities to shared page headers, buttons, and CRUD form labels/helper text.

## Font Fallback Strategy

The app now uses:

```css
Inter, "Khmer OS Battambang", "Noto Sans Khmer", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

No font binaries were added. If Khmer OS Battambang is installed on the device, the browser can use it. If not, `Noto Sans Khmer` remains the fallback.

## Page Title Strategy

Added shared English and Khmer `pageTitles` keys for:

- Landing
- Dashboard
- Products
- Categories
- Branches
- Tables & QR Codes
- Orders
- Kitchen
- Payments
- Reports
- Settings
- Cash Ledger
- Invoices
- Expenses
- Staff
- System Health
- Customer menu
- Cart
- Payment
- Order success

Wired the title strategy into navbar context and the main admin headers for dashboard, products, categories, branches, tables, orders, payments, settings, and system health.

## Landing Improvements

- Updated the hero headline to the clearer QR-system positioning.
- Kept the existing primary "Get started" CTA and secondary "View QR menu demo" CTA.
- Preserved the CSS/Tailwind phone and dashboard mockups.
- Preserved the no fake testimonial, no fake metrics, and no copyrighted asset rules.
- Khmer landing heading now benefits from Khmer line-height and no forced letter spacing.

## Sidebar Improvements

- Module 49 sidebar improvements remain in place.
- Khmer-specific CSS prevents uppercase/letter-spacing from making Khmer group labels cramped.
- Sidebar link and group text inherit Khmer OS Battambang when the app is in Khmer mode.

## Navbar Improvements

- Navbar page titles now use `pageTitles` keys instead of generic common labels.
- Khmer title wrapping and heading line-height are improved through `khmer-heading`.
- Command trigger keeps the honest "Jump to page or action" label and does not imply backend search.

## Centered CRUD Modal Pattern

Module 49's `CrudFormModal` remains the centered popup pattern for CRUD create/edit flows. Module 50 improved its surrounding form typography through shared button and form-control utilities.

## Pages Converted To Centered Modal

- Categories
- Products
- Branches
- Tables & QR Codes

Operational order/payment review drawers remain drawer-based because they are better suited to review workflows.

## Accessibility Rules

- Khmer text uses larger line-height and no letter-spacing.
- Shared page headers keep clear heading hierarchy.
- Buttons keep accessible labels and focus rings.
- CRUD modal dialog semantics from Module 49 remain intact.
- Language-specific typography is activated by the document `lang` attribute.

## Mobile Behavior

- Khmer text wraps with `overflow-wrap: anywhere` for dense labels and descriptions.
- Khmer buttons use a more forgiving line-height and avoid cramped uppercase styling.
- Mobile page titles and modal helper text remain readable at small widths.

## i18n Additions

- Added `pageTitles` keys in English and Khmer.
- Updated landing headline in English and Khmer.
- Kept existing CRUD form keys from Module 49 and used them in converted CRUD modal headers/helper text.

## Tests Added / Updated

- Updated landing tests for the new English and Khmer hero headline.
- Updated dashboard test for stable "Operations Dashboard" title and subtitle.
- Updated system health test to render within `LanguageProvider`.
- Updated CRUD page tests to render with `LanguageProvider` after title translation wiring.

## Known Limitations / TODOs

- Khmer OS Battambang depends on the user's system font availability because no font files were bundled.
- Some legacy feature pages still use older local title strings and can be migrated gradually to the new `pageTitles` keys.
- Staff, expenses, invoices, cash ledger, and customer public pages have translation keys ready, but only the highest-impact admin headers were wired in this focused module.
- Remote GitHub Actions were not checked locally.
