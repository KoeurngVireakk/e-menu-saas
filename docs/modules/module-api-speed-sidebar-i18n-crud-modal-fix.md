# API speed, sidebar, i18n, and CRUD modal fixes

## Scope and diagnosis

The reported baseline was approximately 500 ms for individual API requests, with duplicate browser requests accumulating to roughly one or two seconds. Repository searches found no `sleep` or `usleep` call in the backend request path. `LogSlowApiRequests` measures and logs elapsed time; it does not add a delay.

The main local-development risks were database-backed cache, session, and queue configuration, plus avoidable browser preflight headers and repeated frontend list requests. Backend query payload size was a secondary issue on frequently used list endpoints.

## Changes

- Axios now sends only `Accept: application/json` by default. It no longer globally forces `Content-Type` or `X-Requested-With`; Axios still derives JSON content types for object bodies and upload callers retain explicit multipart handling.
- Authorization, the 10-second timeout, abort signals, and normalized errors remain intact.
- CORS origins remain explicit and wildcard origins are filtered. Preflight responses may be cached for 600 seconds.
- `.env.example` uses fast local defaults: file session/cache, synchronous queue, timing headers, a 100 ms slow-request threshold, and bcrypt cost 4. The production example still recommends Redis and a production-appropriate password hashing cost.
- Current-user ownership remains in `AuthContext` through `useCurrentUser`. Navbar and Sidebar do not fetch `/auth/me`. Shop and branch selectors use their shared React Query hooks. Query stale times and previous-data behavior reduce refetch churn.
- Shop and branch list queries select only fields used by their clients. Category/product relations request narrower branch/category columns. The order list no longer repeats payment logs; authorized detail responses still provide detail data.
- The desktop sidebar is a fixed-height flex column. Its header and workspace card do not shrink, while navigation owns the vertical scroll area. Mobile horizontal navigation is unchanged.
- Shops, print stations, staff, expenses, kitchen stations, and translation editing use the centered, accessible `CrudFormModal`. Operational shift actions and order/payment details remain modals/drawers appropriate to their workflows.
- English and Khmer strings were added for the PWA update prompt and the order/payment review workflows, including proof review, status actions, printing, documents, invoice creation, and payment confirmation/rejection.
- Existing shared page headers, cards, tables, empty states, loading/error states, responsive controls, feedback toasts, and sticky modal footers provide the UI consistency layer for changed features.

## Local speed troubleshooting

1. Set `SESSION_DRIVER=file`, `CACHE_STORE=file`, and `QUEUE_CONNECTION=sync` for local development. Redis is also suitable when it is already running locally.
2. Set `API_TIMING_HEADERS=true` and inspect `Server-Timing`/API timing headers and slow-request logs.
3. Run `php artisan optimize:clear` after changing environment values.
4. Compare a direct backend request with the browser path, for example `curl -i http://127.0.0.1:8000/api/health`. A fast curl request with a slower browser request points toward preflight, frontend duplication, extensions, or network tooling rather than controller execution.
5. Do not copy local bcrypt cost 4 into production. Use a production-appropriate cost and Redis/database infrastructure according to deployment requirements.

## Timing observations

No representative authenticated production-sized dataset or before/after HTTP capture was available in this workspace, so this change does not claim a fabricated latency number. The known baseline is the reported ~500 ms per request. Validate after applying local environment changes using curl and browser Network timing; the expected structural improvements are removal of unnecessary preflight-triggering headers, fewer repeated list requests, fewer session/cache database round trips, and smaller list payloads.

## Tests and limitations

Coverage includes Axios header behavior, explicit CORS origins and max age, sidebar scroll classes, and centered modal opening for shops, print stations, staff, and expenses. Existing CRUD modal and operation drawer coverage remains in place. Vitest configuration continues to exclude Playwright E2E files.

The broad UI still contains legacy hardcoded copy outside the updated PWA and operation-detail flows. Continue migrating feature copy incrementally to the English/Khmer dictionaries; backend product/catalog names must remain unchanged unless localized data exists. Kitchen, expense, shift, staff, print-station, and translation list endpoints can be moved into dedicated React Query hooks in a later pass if cross-component consumers emerge. Full browser timing and optional E2E verification require the local services and test browser stack.
