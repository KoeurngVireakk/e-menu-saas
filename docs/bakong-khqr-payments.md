# Bakong KHQR Payments

Module 23 adds a Bakong KHQR payment foundation while keeping cash and manual KHQR flows working.

ABA PayWay is intentionally excluded from this module. There are no ABA PayWay providers, routes, config keys, environment variables, or frontend payment choices added here.

## Supported Payment Methods

- `cash`: creates a pending manual payment.
- `khqr_manual`: customer uploads manual KHQR proof and optional transaction reference.
- `bakong_khqr`: backend creates a provider payment and returns a dynamic KHQR payload in sandbox/mock mode.

The backend always uses the stored order or invoice total. Frontend-submitted amounts are ignored.

## Provider Architecture

Payment providers live under:

```text
app/Services/Payments
```

Current classes:

- `PaymentProviderInterface`
- `PaymentResult`
- `ManualPaymentProvider`
- `BakongKhqrProvider`
- `PaymentManager`
- `PaymentStatusSync`

`PaymentManager` selects a provider from the submitted payment method. Existing manual payment records remain display-compatible, but new customer payment initiation is limited to cash, manual KHQR, and Bakong KHQR.

## Environment Placeholders

Configure these in production only through environment secrets:

```text
PAYMENT_SANDBOX_MODE=true
BAKONG_KHQR_ENABLED=false
BAKONG_KHQR_MERCHANT_ID=
BAKONG_KHQR_TOKEN=
BAKONG_KHQR_API_URL=
BAKONG_KHQR_WEBHOOK_SECRET=
```

Never commit real Bakong credentials.

## Sandbox Testing

When `PAYMENT_SANDBOX_MODE=true`, Bakong KHQR initiation returns deterministic mock-safe QR payload data. This allows local development and CI to verify the flow without live Bakong credentials.

The sandbox QR payload includes:

- merchant placeholder
- provider reference
- backend-owned amount
- backend-owned currency
- order number

## Webhook Security

Webhook endpoint:

```text
POST /api/webhooks/bakong-khqr
```

If `BAKONG_KHQR_WEBHOOK_SECRET` is configured, the endpoint requires `X-Bakong-Signature` with an HMAC-SHA256 signature of the raw request body.

The webhook only stores safe fields:

- provider reference
- provider payment ID
- status
- amount
- currency
- failure reason

It does not log authorization headers, tokens, secrets, or raw sensitive payloads.

## Payment Sync

When a valid Bakong webhook marks a payment paid:

- `payments.status = paid`
- `orders.payment_status = paid`
- linked invoice, if any, becomes `paid`
- invoice `paid_amount` is set to the payment amount
- invoice `balance_due = 0`
- invoice `paid_at` is set

Before marking paid, the webhook verifies that amount and currency match the backend-owned payment record.

## Future Work

Recommended future enhancements:

- live Bakong API client once production credentials are available
- refund and partial refund support
- payment polling fallback for missed webhooks
- Telegram payment alerts for shop staff
- thermal receipt auto-print after verified payment
