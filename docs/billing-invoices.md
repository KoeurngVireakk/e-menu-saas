# Billing and Invoices

Module 22 adds the billing foundation for Cambodia-ready restaurant operations.

## Currency Rules

Supported currencies:

- `KHR`
- `USD`

Each shop has a base currency. Existing shops default to `KHR`. A shop may also enable a secondary currency display, usually:

- base `KHR`, secondary `USD`
- base `USD`, secondary `KHR`

The exchange rate is stored as KHR per 1 USD. For example, `4100` means USD 1 equals KHR 4,100.

## Total Calculation Rules

The backend is the source of truth for all totals. The frontend never supplies trusted totals.

Order calculation:

1. Calculate item subtotal from product price, discount price, option extra prices, and quantity.
2. Apply `default_discount_percentage` to subtotal.
3. Calculate service charge on `subtotal - discount_total`.
4. Calculate VAT/tax on `subtotal - discount_total`.
5. Grand total is discounted subtotal plus service charge plus tax.

Formula:

```text
discount_total = subtotal * discount_percentage
taxable_base = subtotal - discount_total
service_charge = taxable_base * service_charge_percentage
tax_total = taxable_base * tax_percentage
grand_total = taxable_base + service_charge + tax_total
```

This keeps discount behavior predictable and avoids taxing the discounted-away amount.

## Shop Billing Settings

Billing settings are stored in `shop_settings`:

- `base_currency`
- `display_secondary_currency`
- `secondary_currency`
- `exchange_rate`
- `service_charge_percentage`
- `tax_percentage`
- `default_discount_percentage`
- `receipt_footer_text`
- `invoice_prefix`
- `receipt_prefix`

The existing `shops.currency_code` is kept in sync with the base currency.

## Receipt Flow

Admin receipt endpoint:

```text
GET /api/orders/{order}/receipt
```

Allowed users:

- super admin
- shop owner
- manager
- cashier
- waiter, only for assigned shop or branch

Receipts are generated from the order and include shop, branch, table, items, options, subtotal, discount, service charge, VAT/tax, grand total, payment status, and optional secondary currency total.

## Invoice Flow

Invoice endpoints:

```text
POST /api/orders/{order}/invoice
GET /api/invoices
GET /api/invoices/{invoice}
PUT /api/invoices/{invoice}/mark-paid
PUT /api/invoices/{invoice}/cancel
```

Allowed invoice users:

- super admin
- shop owner
- manager
- cashier

Waiters cannot create, cancel, or mark invoices paid.

Creating an invoice copies the order totals and order items into `invoices` and `invoice_items`. This gives each issued invoice a stable historical record even if product names or prices change later.

## Cambodia Notes

This foundation supports common Cambodia restaurant and cafe operations:

- KHR menu prices with optional USD display
- USD-friendly venues with KHR receipt display
- VAT/service charge display
- receipt footer text in Khmer or English
- invoice prefixes such as `INV`
- receipt prefixes such as `RCPT`

## Future Payment Integrations

Future ABA PayWay and Bakong KHQR modules should:

- use invoice/order grand total from the backend
- store payment references without exposing tokens
- reconcile paid invoices through payment callbacks
- keep KHR/USD conversion rules centralized in billing settings

## Future Thermal Printer Work

The frontend receipt component includes an 80mm print-friendly layout. A future printer module should add:

- 58mm layout toggle
- ESC/POS thermal printer support
- branch printer routing
- Khmer font validation
- automatic kitchen/customer receipt printing
