# Smoke Test Checklist

Run this after deploy, rollback, restore, or infrastructure changes.

## Public Pages

- `/`
- `/login`
- `/register`
- `/menu/:shopSlug`
- `/cart`
- `/payment/:orderNumber`
- `/order-success/:orderNumber`

## Admin Pages

- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/payments`
- `/admin/kitchen`

## API Checks

- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/public/shops/{slug}/menu`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Operational Flow

- Create or update a product.
- Submit a public order.
- Upload a payment proof image.
- Confirm or reject a payment as an authorized user.
- Update order status.
- Confirm kitchen page receives expected state.
- Confirm realtime status is connected where Reverb is enabled.
- Confirm logs do not contain secrets.
- Confirm queue worker and scheduler are running.
- Confirm latest backup is present and within retention policy.
