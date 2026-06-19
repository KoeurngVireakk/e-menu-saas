# Module 45 - Automated E2E, Screenshot QA & Visual Regression Testing

## Status

Module 45 adds Chromium-first Playwright smoke testing, responsive screenshot artifacts, axe dependency readiness, console error protection, and a manual CI workflow.

## Coverage

- Landing conversion and English/Khmer switching.
- Login/register and deterministic owner authentication.
- Admin shell and command palette navigation.
- Public menu, product detail, add-to-cart, and sticky cart.
- Desktop/mobile landing and public-menu screenshot artifacts.

## Strategy

Phase 1 uses safe route fixtures rather than production data. Screenshot artifacts are captured with reduced motion and animation suppression; pixel baselines are deferred until cross-platform stability is proven. A guarded Laravel seeder, full CRUD/order/payment/report flows, and axe assertions are Phase 2 tasks.

## Commands

- `npm run test:e2e`
- `npm run test:e2e:ui`
- `npm run test:e2e:headed`
- `npm run test:e2e:report`
- `npm run test:visual`

The manual GitHub workflow installs Chromium, runs unit/build/E2E checks, and uploads Playwright artifacts on failure. No production secrets are required.
