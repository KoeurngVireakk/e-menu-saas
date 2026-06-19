# E2E And Visual QA

Run `npm install`, `npx playwright install chromium`, then `npm run test:e2e` from `frontend`.

Phase 1 uses deterministic Playwright route fixtures and does not touch production data. Screenshots are test artifacts in `test-results/e2e`; they are not pixel baselines. Use `npm run test:visual` for responsive captures and `npm run test:e2e:report` for the HTML report.

Debug with `npm run test:e2e:headed` or `npm run test:e2e:ui`. Traces, videos, and screenshots are retained on failure. Do not commit `playwright-report`, `test-results`, videos, traces, or secrets. Add snapshot baselines only after a stable cross-platform baseline policy is agreed.

Console errors and uncaught page errors fail protected smoke tests. Known warnings must be documented before allowlisting.
