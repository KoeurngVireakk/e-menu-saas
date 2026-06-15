# Redbox-Inspired Enterprise Enhancement Roadmap

This roadmap compares E-Menu SaaS against the researched Redbox Invoice and Redbox Digital Menu feature set, then proposes a Cambodia-focused module plan from Module 20 through Module 30.

## 1. Competitor Feature Analysis

Redbox appears to compete across two adjacent products:

- Digital menu and restaurant ordering.
- Invoice and payment workflow.

Observed competitor strengths:

- QR digital menu: QR-first customer entry point.
- Restaurant profile management: business info, menu link, and QR code utilities.
- Category/product management: basic menu operations.
- Multi-language menu: important for Khmer/English customer experiences.
- Menu templates/themes: fast visual customization for different restaurant brands.
- Dark mode: customer-facing and admin usability.
- Online ordering: captures orders directly from menu.
- ABA PayWay: local payment fit for Cambodia.
- Invoice creation: expands from ordering into B2B/B2C billing.
- Customer history: enables repeat customer service and reporting.
- PDF invoice templates: useful for sharing, printing, and compliance.
- Mark paid/share/print: practical day-to-day cashier flow.
- Multi-currency: KHR/USD support is essential in Cambodia.
- VAT/discount/delivery fee: more complete order/invoice totals.
- Digital signature/deposits: enterprise invoice controls.
- Thermal printer support: critical for kitchens, cafés, bars, and clubs.
- Unit of measurement: important for retail, grocery, alcohol, and inventory-like menus.
- Template color picker: low-cost brand customization.

E-Menu SaaS already has a strong operational foundation: Laravel API, React admin/customer UI, product options, cart/orders/payments, PWA shell, role-based permissions, audit logs, health checks, tests, CI, staff management, and tenant settings.

## 2. Feature Gap Analysis

| Area | Current E-Menu State | Gap |
| --- | --- | --- |
| QR menu | Public menu and table QR exist | Needs QR download/export polish and copy menu link workflow |
| Restaurant info | Shop/settings exist | Needs customer-visible template/theme settings and social/contact fields |
| Categories/products | Exists with options/add-ons | Needs units of measurement and stronger bulk/menu operations |
| Multi-language | Not implemented | Khmer/English fields, language switcher, translation workflow |
| Themes/templates | Basic colors/settings | Needs template presets, dark mode, font/layout options |
| Online ordering | Exists | Needs richer fees, discounts, taxes, order auto-accept integration |
| Local payments | Manual payment proof exists | Needs ABA PayWay and Bakong KHQR integrations |
| Invoices | Not implemented | Needs invoice tables, PDF generation, print/share/mark-paid |
| Customer history | Limited order customer fields | Needs customer profiles and order/payment history |
| Multi-currency | Shop currency exists | Needs true KHR/USD totals, exchange rates, invoice currency |
| VAT/discount/delivery fee | Basic order totals exist | Needs configurable tax/service/delivery/discount engine |
| Digital signature/deposit | Not implemented | Needed for enterprise invoicing |
| Thermal printer | Not implemented | Needed for cashier/kitchen workflows |
| Telegram notification | Not implemented | High-value Cambodia ops feature for owners/managers |
| SaaS billing | Not implemented | Needed for subscription tiers and monetization |

## 3. Recommended Modules: Module 20 To Module 30

### Module 20: Tenant Settings + Staff Management

Status: current baseline/in progress in the repository.

Scope:

- Staff management by shop and branch.
- Tenant settings for branding, currency, service charge, tax, and order defaults.
- Audit staff/settings changes.

Priority: MVP.

### Module 21: Khmer/English Multi-Language Menu

Scope:

- Add Khmer/English fields for shop, category, product, option, option value, and public menu text.
- Customer language switcher.
- Admin translation editing.
- Fallback language behavior.

Priority: Business-critical.

Why:

- Cambodia market needs Khmer and English by default.
- Improves restaurant/café/club usability immediately.

### Module 22: QR Code + Menu Link Toolkit

Scope:

- Download QR code as PNG/PDF.
- Copy public menu link.
- Branch/table QR bulk export.
- Branded QR poster template.
- Optional short menu URL.

Priority: MVP.

Why:

- QR distribution is core to digital menu adoption.
- Simple, high-impact operational feature.

### Module 23: Menu Themes, Templates, And Dark Mode

Scope:

- Customer menu template presets.
- Theme color picker.
- Dark/light mode.
- Typography and layout options.
- Per-shop theme preview.

Priority: Business-critical.

Why:

- Reduces customization friction.
- Helps sell to cafés, clubs, and premium restaurants.

### Module 24: Local Payments Integration

Scope:

- ABA PayWay integration.
- Bakong KHQR dynamic QR support.
- Payment webhook handling.
- Payment status reconciliation.
- Safer payment event logs.

Priority: Business-critical.

Why:

- Cambodia payment adoption depends on ABA and KHQR.
- Removes manual payment confirmation burden.

### Module 25: Fees, Discounts, Tax, Delivery, And Multi-Currency Totals

Scope:

- VAT/tax rules.
- Service charge rules.
- Delivery fee.
- Order-level discounts.
- Product-level discounts.
- KHR/USD display and settlement strategy.
- Exchange rate storage if needed.

Priority: Business-critical.

Why:

- Required for real restaurant billing.
- Foundation for invoices and accounting.

### Module 26: Invoice Engine

Scope:

- Invoice creation from order or manual form.
- Invoice number sequence per shop.
- PDF invoice templates.
- Mark paid/unpaid/void.
- Share and print invoice.
- Deposits and balance due.
- Digital signature image or typed approval.

Priority: Enterprise.

Why:

- Redbox Invoice overlaps here.
- Expands E-Menu from ordering into restaurant billing and event/club reservations.

### Module 27: Customer History And CRM Lite

Scope:

- Customer records from orders/invoices.
- Order/payment/invoice history.
- Customer notes.
- Repeat customer tagging.
- Export basic customer list.

Priority: Enterprise.

Why:

- Useful for cafés, delivery, membership clubs, and event venues.
- Supports marketing and retention.

### Module 28: Telegram Notifications And Operations Alerts

Scope:

- Telegram bot configuration per shop.
- New order notifications.
- Payment received/failed notifications.
- Daily sales summary.
- Staff/manager notification routing.

Priority: Business-critical.

Why:

- Telegram is widely used in Cambodia business operations.
- Fast operational win without needing a full mobile app.

### Module 29: Thermal Printer And Kitchen Printing

Scope:

- Browser print layout for receipts.
- Kitchen ticket format.
- ESC/POS-compatible integration path.
- Print queue status.
- Reprint order/invoice.

Priority: Enterprise.

Why:

- Restaurants, cafés, clubs, and bars need physical kitchen/cashier workflows.

### Module 30: SaaS Billing, Plans, And Tenant Limits

Scope:

- Subscription plans.
- Feature flags per plan.
- Shop/branch/table/product/staff limits.
- Trial period.
- Billing status.
- Admin tenant overview.

Priority: Future/enterprise foundation.

Why:

- Enables monetization and controlled rollout.
- Required before scaling multi-tenant sales.

## 4. Priority Ranking

### MVP

- Module 20: Tenant Settings + Staff Management.
- Module 22: QR Code + Menu Link Toolkit.

### Business-Critical

- Module 21: Khmer/English Multi-Language Menu.
- Module 23: Menu Themes, Templates, And Dark Mode.
- Module 24: ABA PayWay + Bakong KHQR.
- Module 25: Fees, Discounts, Tax, Delivery, Multi-Currency.
- Module 28: Telegram Notifications.

### Enterprise

- Module 26: Invoice Engine.
- Module 27: Customer History And CRM Lite.
- Module 29: Thermal Printer And Kitchen Printing.

### Future

- Module 30: SaaS Billing, Plans, And Tenant Limits.
- Advanced inventory.
- Loyalty and coupons.
- Custom domain per tenant.
- White-label reseller mode.

## 5. Database Tables Needed

Likely additions:

- `translations` or localized columns:
  - Option A: add `name_km`, `name_en`, `description_km`, `description_en` to shops/categories/products/options.
  - Option B: generic `translatable_strings` table.
- `menu_themes`:
  - `id`, `shop_id`, `template_key`, `mode`, `primary_color`, `secondary_color`, `font_key`, `layout_key`, timestamps.
- `qr_exports` or no table initially:
  - QR files can be generated on demand unless tracking downloads is needed.
- `payment_providers`:
  - `id`, `shop_id`, `provider`, `status`, encrypted config, timestamps.
- `payment_events`:
  - provider webhook payload summaries, event IDs, payment/order links, status.
- `tax_rules`:
  - `shop_id`, `name`, `rate`, `applies_to`, `status`.
- `discounts`:
  - order/product scoped discounts, fixed/percentage type, active dates.
- `delivery_zones`:
  - optional delivery fee by area.
- `exchange_rates`:
  - source currency, target currency, rate, effective date.
- `invoices`:
  - invoice number, shop/customer/order refs, currency, totals, status, due date.
- `invoice_items`:
  - description, unit, quantity, unit price, discounts, tax.
- `invoice_payments`:
  - deposits, balance payments, method, reference, status.
- `invoice_templates`:
  - shop-specific PDF/print template and colors.
- `customers`:
  - name, phone, email, address, shop scope.
- `customer_notes`:
  - CRM notes and staff author.
- `telegram_integrations`:
  - shop ID, bot/chat config, encrypted token, enabled events.
- `print_jobs`:
  - order/invoice ref, printer target, status, retry count.
- `subscription_plans`, `tenant_subscriptions`, `feature_flags`:
  - SaaS monetization and limits.

Existing tables to extend carefully:

- `shops`: contact/branding already exists.
- `shop_settings`: can store simple settings before dedicated tables are justified.
- `orders`: needs fees/discounts/tax/delivery/currency fields expanded.
- `payments`: needs provider IDs, webhook status, and reconciliation fields.

## 6. Backend API Modules Needed

Recommended API areas:

- Localization:
  - `GET/PUT /api/shops/{shop}/translations`
  - localized public menu response.
- QR toolkit:
  - `GET /api/tables/{table}/qr/download`
  - `GET /api/shops/{shop}/qr/bulk`
  - `GET /api/shops/{shop}/menu-link`
- Theme settings:
  - `GET/PUT /api/shops/{shop}/theme`
  - public menu theme payload.
- Payment integrations:
  - `GET/PUT /api/shops/{shop}/payment-providers`
  - `POST /api/payments/{payment}/payway/initiate`
  - `POST /api/payments/{payment}/khqr/initiate`
  - webhook endpoints with signature validation.
- Fees/totals engine:
  - `GET/PUT /api/shops/{shop}/billing-settings`
  - calculation service used by order and invoice flows.
- Invoice module:
  - `apiResource('invoices')`
  - `POST /api/invoices/{invoice}/mark-paid`
  - `POST /api/invoices/{invoice}/void`
  - `GET /api/invoices/{invoice}/pdf`
  - `POST /api/invoices/{invoice}/share`
- Customer module:
  - `apiResource('customers')`
  - `GET /api/customers/{customer}/history`
- Telegram:
  - `GET/PUT /api/shops/{shop}/telegram`
  - `POST /api/shops/{shop}/telegram/test`
- Print:
  - `POST /api/orders/{order}/print`
  - `POST /api/invoices/{invoice}/print`
  - `GET /api/print-jobs`
- SaaS billing:
  - tenant plan endpoints, billing status, feature flag checks.

## 7. Frontend Pages And Components Needed

Admin pages:

- `/admin/translations`
- `/admin/qr-tools`
- `/admin/menu-theme`
- `/admin/payment-integrations`
- `/admin/billing-settings`
- `/admin/invoices`
- `/admin/invoices/:id`
- `/admin/customers`
- `/admin/customers/:id`
- `/admin/notifications`
- `/admin/printing`
- `/admin/subscription`

Public/customer UI:

- Khmer/English language switcher.
- Theme-aware menu renderer.
- Dark mode toggle or automatic theme.
- KHQR/ABA payment status screen.
- Invoice public share view if invoices are shareable.

Reusable components:

- `LanguageTabs`
- `LocalizedInputGroup`
- `QrDownloadButton`
- `CopyMenuLinkButton`
- `ThemePreview`
- `CurrencyInput`
- `TotalsBreakdown`
- `PaymentProviderBadge`
- `InvoicePreview`
- `PdfTemplatePicker`
- `CustomerHistoryPanel`
- `TelegramTestButton`
- `PrintJobStatus`

## 8. Security And Permission Concerns

Key rules:

- Backend remains the source of truth.
- Frontend permissions only hide or disable controls.
- Payment provider credentials must be encrypted at rest.
- Webhooks must validate signatures and reject replayed events.
- Invoice PDFs should not expose private internal IDs or staff-only notes.
- Public invoice/share links need signed URLs or expiring tokens.
- Telegram bot tokens must never be exposed to the frontend.
- Staff permissions should be audited when changed.
- Customer data export should be owner/super-admin only.
- Thermal printing endpoints should prevent cross-tenant order/invoice access.
- Multi-currency calculations should store exact currency and rate used at transaction time.

Permission considerations:

- `shop_owner`: manage shop settings, payment integrations, invoices, customers, staff.
- `manager`: manage menu, orders, printing, limited invoices/customers if enabled.
- `cashier`: manage orders, payments, receipts, invoice mark-paid.
- `waiter`: manage table orders and customer service tools.
- `super_admin`: platform oversight, tenant support, plan control.

## 9. Monetization And SaaS Plan Opportunities

Suggested package tiers:

- Starter:
  - QR menu, basic products/categories, table QR, manual payments.
- Growth:
  - online ordering, Khmer/English, themes, Telegram notifications, staff roles.
- Pro:
  - ABA PayWay, Bakong KHQR, customer history, advanced fees/discounts, thermal printing.
- Enterprise:
  - invoice engine, PDF templates, digital signature, deposits, custom branding, priority support.

Usage-based or add-on revenue:

- Additional branches.
- Additional table QR codes.
- Additional staff seats.
- Payment integration fee.
- Invoice/PDF module.
- Telegram notification pack.
- Custom template/theme pack.
- White-label setup fee.

Cambodia-specific sales angles:

- KHR/USD-ready menus and invoices.
- ABA and KHQR support.
- Khmer/English customer experience.
- Telegram-first operations.
- Café/restaurant/club workflows.
- Thermal printer support for cashier and kitchen.

## 10. Best Next Module To Build First

Recommended next module: **Module 21: Khmer/English Multi-Language Menu**.

Why this should be next:

- It is a Cambodia-market differentiator and a daily customer-facing need.
- It improves the existing public menu without requiring external payment provider contracts.
- It supports restaurants, cafés, and clubs immediately.
- It lays the foundation for localized invoices, customer messages, QR posters, and Telegram notifications.
- It is lower integration risk than ABA PayWay/KHQR and easier to test deterministically.

Suggested Module 21 scope:

- Add Khmer/English fields or a translation table for shops, categories, products, product options, and option values.
- Add admin translation editing.
- Add public language switcher.
- Add fallback rules.
- Add tests for localized public menu response and UI rendering.
