# Module 61 - High-Impact Screen UX Polish & Premium Interaction Details

## Purpose

Module 61 builds on the Module 60 visual system work with a focused pass on screens people use most often: customer QR ordering, checkout, payment, order success, operations drawers, kitchen cards, notifications, and centered CRUD modals.

This module does not add UI libraries, fake operational data, change backend business logic, remove routes, or alter auth, public ordering, reports, PWA, API, profile, notification, or settings behavior.

## Customer QR Improvements

- Checkout now has a compact three-step review strip so customers understand the flow before submitting.
- Sticky checkout action uses a calmer premium surface with safe-area padding and backdrop treatment.
- Product detail options now make required groups more visible before selection and provide short helper text.
- Cart item cards have stronger tap affordance, better Khmer text wrapping, cleaner option/note hierarchy, and a more tactile quantity control.
- Payment proof upload now has clearer helper copy, a bounded preview surface, and a full-width mobile submit action.
- Order success now explains the next step, improves mobile action stacking, and keeps continue-payment obvious.

## Admin Operations Improvements

- Order detail drawers now use Khmer-readable labels instead of uppercase tracked labels.
- Order action groups and print/document actions stack cleanly on mobile and remain fast to scan on desktop.
- Payment detail drawers have a bounded proof preview, clearer review actions, and more readable metadata tiles.
- Kitchen order cards better separate order identity, table/branch context, elapsed time, payment status, notes, and next actions.
- Kitchen card actions now use existing i18n labels for English and Khmer.

## Notifications Improvements

- Notification and account activity cards gained a subtler interactive surface.
- Notification actions now stack under content on small screens instead of squeezing the message body.
- Event/type chips use Khmer-safe label styling and retain text-backed unread/action states.

## CRUD Improvements

- Centered CRUD forms retain the Module 60 modal behavior.
- The shared modal body spacing is slightly more generous on larger screens while preserving one-column mobile layout, sticky footer actions, Escape behavior, and save-in-progress protection.

## I18n Improvements

- Added customer QR keys for checkout steps, product option helper text, order-success next-step copy, order status timeline naming, and payment proof preview.
- Added operations keys for elapsed minutes, item-ready action, and new-order badge.
- Khmer strings are paired with English strings and avoid forced uppercase or extra letter spacing.

## Accessibility And Responsive Notes

- Dialog and drawer semantics remain unchanged and named.
- Interactive controls keep visible focus rings and text labels.
- Mobile checkout, payment proof preview, notification actions, and kitchen/order actions are designed to stack without horizontal overflow.
- Sticky checkout and modal footer actions continue to respect safe-area insets.

## Tests Added Or Updated

- No behavior tests were added because this pass changes presentation, copy, and layout only.
- Existing modal, public ordering, notification, operation, and build tests remain the regression coverage for this module.

## Known Limitations

- This module did not run browser screenshot or physical-device QA.
- Some older admin kitchen/station page strings remain English-only outside the edited card/action surfaces.
- GitHub Actions status is not implied by local checks.
