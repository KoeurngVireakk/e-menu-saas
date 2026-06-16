# Module 34 - Customer QR Menu and Checkout Experience Polish

## Purpose

Module 34 upgrades the customer-facing QR ordering flow into a mobile-first restaurant ordering experience. It focuses on fast browsing, clean product details, a clearer cart and checkout path, trustworthy payment review, and understandable order status.

## Pages Improved

- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`
- `PublicMenuLayout`

## Old UX Problems

- Product detail configuration lived inside the menu page instead of a reusable public component.
- The cart summary was always visible, including when empty.
- Checkout items had limited visual hierarchy and no image support.
- Payment proof upload did not preview the selected image.
- Order success had a basic success card but no customer-friendly timeline.

## New Mobile-First Customer Flow

1. Customer scans QR.
2. The menu opens with restaurant, branch, table, language, and search context.
3. Customer browses sticky category tabs or searches products.
4. Product cards open a bottom-sheet style detail view.
5. Product options, quantity, and notes are configured before adding to cart.
6. Sticky cart bar appears only after items are added.
7. Checkout shows item details, options, notes, totals, and customer fields.
8. Payment page shows order amount, payment status, proof preview, and KHQR/manual instructions.
9. Success page shows status badges, live tracking note, receipt, payment action, and timeline.

## Menu Browsing UX

- Sticky restaurant header with logo/cover support.
- Locale switcher remains available in the header.
- Search supports product name and description.
- Category tabs show product counts and smooth-scroll to sections.
- Products are grouped by category.
- Empty search state includes a clear action.
- Loading state uses public skeletons.

## Product Detail UX

- `ProductDetailSheet` replaces the inline product modal.
- Large image, description, price, discount price, feature/sold-out badges, and preparation time are supported.
- Existing product option payloads remain unchanged.
- Required option validation stays client-side before adding to cart.
- Customer item notes are preserved in the cart item payload.

## Cart / Checkout UX

- `StickyCartBar` appears only when the cart has items.
- `PublicCartSummary` shows image, name, options, item note, quantity controls, remove action, unit price, and item total.
- Checkout form keeps existing public order payload compatibility.
- Submit remains disabled when offline, empty, loading, or missing shop/branch context.

## Payment UX

- `PaymentStatusCard` shows order number, amount, current payment status, method/provider, and reference when available.
- Manual KHQR proof upload includes local image preview.
- Bakong KHQR result output remains supported.
- No provider secrets, raw webhook payloads, or internal tokens are displayed.

## Order Success / Status UX

- Success page uses a larger confirmation state and customer-friendly message.
- Status and payment badges remain text-based.
- `OrderStatusTimeline` shows pending, accepted, preparing, ready, and completed steps.
- Existing `LiveOrderStatus` is retained, but guest realtime remains limited until secure guest tracking tokens exist.

## Animation Rules

- Product cards fade in subtly.
- Product detail sheet uses the existing modal slide/fade behavior.
- Sticky cart bar slides up when cart items exist.
- Cart items animate lightly when rendered.
- Motion is short and functional, not decorative.

## Accessibility Checklist

- Product image and proof preview have alt text.
- Product cards and category tabs use real buttons.
- Quantity controls have accessible labels.
- Dialogs expose titles through the existing modal aria label.
- Status is displayed as text, not color only.
- Form fields use visible labels on checkout and payment pages.

## Manual Test Routes

- `/menu/{shopSlug}?locale=en`
- `/menu/{shopSlug}?locale=km`
- `/cart?shop={shopId}&branch={branchId}&table={tableCode}&locale=en`
- `/payment/{orderNumber}?locale=en`
- `/order-success/{orderNumber}?locale=en`

## Known Limitations / TODOs

- Guest realtime order tracking is not faked; it still depends on future secure guest tracking tokens.
- The cart back action uses browser history to avoid constructing a menu route from shop id when the slug is not available.
- Service charge and tax are displayed after backend returns them on the order success receipt; checkout preview currently shows cart total only.
- Desktop menu is improved but remains intentionally mobile-first.
