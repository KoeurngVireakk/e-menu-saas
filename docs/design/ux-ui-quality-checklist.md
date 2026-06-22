# MenuDIGI UX/UI Quality Checklist

## Spacing

- Use consistent page rhythm: compact controls, roomy sections, and no crowded dense panels.
- Keep mobile padding intentional: 16px minimum on customer flows, 24px+ on admin desktop panels.
- Avoid nested cards unless the inner card is a real repeated item, modal, or framed tool.

## Typography

- Use `Inter, "Khmer OS Battambang", "Noto Sans Khmer", system-ui, sans-serif` generally; when Khmer is active, prefer `"Khmer OS Battambang", "Noto Sans Khmer", Inter, system-ui, sans-serif`.
- Reserve large display type for landing and page-level headings.
- Keep labels short, direct, and scannable.
- Khmer copy must have enough line height and should not be forced into tiny badges.

## Buttons

- Primary buttons are for the next best action.
- Secondary buttons are for safe alternatives.
- Destructive actions need explicit wording and confirmation.
- Icon buttons require accessible labels.
- Loading buttons must show busy state and avoid duplicate submissions.

## Cards

- Cards should clarify state or group related actions.
- Use white cards, thin slate borders, and restrained shadows.
- Empty cards must include next action or guidance.

## Drawers

- Drawers need accessible titles, dialog semantics, and sticky footer actions.
- Create/edit forms should stay drawer-based and list-first.
- Long forms need section grouping, validation guidance, and clear save/cancel actions.
- Unsaved-change protection is a future enhancement unless tracked form dirtiness is available.

## Tables

- Keep tables scannable with strong row identity, status badges, and clear row actions.
- Use filter/search toolbars above the table.
- No-results states should offer clear filter reset.
- Mobile tables should have card/grid alternatives when possible.

## Mobile

- Customer ordering must prioritize product choice, cart visibility, and checkout confidence.
- Tap targets should be large enough for one-handed use.
- Sticky bars must not hide critical form fields.
- Avoid tiny scroll traps inside cart/order summaries.

## Empty States

- Empty states should explain what happened and the next useful action.
- First-time setup should guide owners toward shop, branch, category, product, table QR, and test order steps.
- Do not show fake metrics or fake completion.

## Error States

- Errors should state the problem and give retry or recovery actions.
- Offline states must clearly disable ordering when submit would fail.
- Payment proof warnings should explain what the restaurant will review.

## Bilingual UX

- Shared labels should come from i18n.
- Do not translate backend product names unless backend translations are supplied.
- Language toggles must be visible in landing, auth, admin shell, and public menu.

## Accessibility

- Dialogs need role, modal semantics, and readable titles.
- Forms need labels and readable validation messages.
- Realtime status must include text, not color alone.
- Keyboard navigation must work for command/search and modal close.
- Focus rings should be visible on interactive controls.

## Animation

- Use 150ms-300ms for controls and 300ms-500ms for larger page/section transitions.
- Prefer ease-out transitions.
- Avoid excessive bounce.
- Motion must not be required to understand state.

## Performance

- Keep route lazy loading.
- Keep charts lazy and out of landing/public bundles.
- Do not import Echo/Pusher globally.
- Do not import SweetAlert2 into landing/public code.
- Preserve Vite manual chunk strategy and avoid large chunk warnings.

## Module 43 Practical Review

- Desktop review: scan `/admin`, CRUD pages, reports, and operations pages at 1024px and 1440px for crowded toolbars, weak headings, unclear primary actions, and nested card clutter.
- Mobile review: scan customer ordering, cart, payment, and admin drawers at 375px and 430px for tap target size, sticky footer overlap, horizontal overflow, and long Khmer wrapping.
- Keyboard review: open command palette with Ctrl/Cmd+K, tab through filters, drawers, language toggles, cart quantity controls, and modal close buttons.
- Khmer review: switch landing/auth/admin/public flows to Khmer and check headings, badges, buttons, and empty states for natural copy and readable line height.
- Empty-state review: verify every first-time state explains the benefit, what happened, and the next useful action without fake data.
- Error-state review: verify retry paths exist where data loading can fail, and that errors do not imply user data was changed.
- Offline review: confirm public menu can show cached menu data, checkout submission is disabled offline, and offline copy explains recovery.
- CRUD drawer review: confirm dialog titles are announced, footer actions remain sticky, cancel/save hierarchy is clear, and long forms do not become two-column CRUD.
- Realtime review: confirm connected, reconnecting, paused, unavailable, and issue states use text and tooltips, not color alone.
- Performance review: run production build and confirm charts remain lazy/admin-only, Echo/Pusher is not globally imported, and no large chunk warning returns.

## Module 44 Pixel QA

- Pixel QA checklist: compare headings, card radius, button height, icon size, borders, shadows, and section spacing on landing, auth, admin, reports, operations, and public ordering screens.
- Mobile QA checklist: at 375px and 430px, verify no horizontal overflow, sticky cart/payment bars do not cover fields, drawer footers remain usable, and action buttons stay at least 40px high.
- Tablet QA checklist: at 768px and 1024px, verify admin nav, command palette, reports filters, kitchen cards, and payment drawers wrap without crowding.
- Bilingual QA checklist: review Khmer in hero, auth, navbar command trigger, empty states, reports, checkout, payment, and realtime labels; avoid tiny badges for long Khmer text.
- Accessibility QA checklist: verify icon-only controls have labels, category tabs expose selected state, validation uses visible inline text, realtime status includes text, and command palette has a dialog title.
- Loading/empty/error checklist: every state should answer what happened, whether user data changed, and what the user can do next.
- CRUD drawer checklist: keep list-first CRUD, sticky save/cancel footer, one-column mobile forms, readable helper text, and clear destructive confirmations.
- Customer QR ordering checklist: product cards must have large tap targets, cart must stay visible, options must validate inline, offline submit must be disabled, and payment proof must not persist in localStorage.
- Performance checklist: preserve lazy routes, lazy charts, dynamic realtime/payment libraries, PWA behavior, and a production build with no large chunk warning.

## Module 46 Feature-Wide QA

- Feature inventory checklist: review landing, auth, admin shell, dashboard, setup, catalog, operations, reports, business tools, customer QR ordering, and CI/test workflows before editing.
- Shared-component-first checklist: fix recurring issues in `AppSheet`, form controls, state components, tables, and CRUD drawers before touching individual pages.
- Drawer checklist: title and description must be announced, Escape should close, focus should return to the trigger, the background should not scroll, and footer actions should remain reachable on mobile.
- Form checklist: labels must be explicit, helper/error text must be associated with fields, invalid state must not rely only on color, upload controls need readable labels, and Khmer copy must have adequate line height.
- Table checklist: tables need an accessible label, sortable headers should expose sort state, row actions need clear labels, and empty/no-results states should provide the next useful action.
- Product options checklist: preserve backend payload shape, validate JSON before submit, show a copyable example, and document a visual builder TODO until the backend contract is ready.
- Operations checklist: order, kitchen, and payment actions should be obvious, two-tap where practical, and destructive or irreversible actions should use clear confirmation copy.
- Customer QR checklist: cart visibility, offline submit blocking, required option validation, payment proof preview, and order status timeline must be reviewed in both languages.
- CI separation checklist: Vitest must only collect `src/**/*.{test,spec}.{js,jsx,ts,tsx}`; Playwright specs stay in `e2e`; production build must keep charts and realtime code out of public/landing chunks.

## Module 46 Research-Inspired QA

- Research-source checklist: use external SaaS, design-system, and QR-ordering references only as principles for hierarchy, flow, and accessibility; do not copy screenshots, layouts, text, brand assets, or icons.
- Merchant empty-state checklist: every first-time setup, list, table, and chart empty state should explain the business benefit and show the next useful action when one is safe.
- Dashboard panel checklist: KPI, chart, report, and operation panels should have clear descriptions, stable numeric alignment, no color-only status meaning, and opt-in accessible region names where they do not collide with form labels.
- Navigation checklist: sidebar and command-palette paths should prioritize frequent restaurant workflows and must not imply backend record search when only route jumping exists.
- QR friction checklist: customer ordering must avoid PDF-like tiny text, hidden carts, forced app downloads, unclear table context, slow-feeling loading states, and confusing payment instructions.
- Mobile restaurant checklist: at 375px and 430px, verify category tabs, product cards, option controls, cart review, payment proof upload, and status timeline remain readable in English and Khmer.
- Operations checklist: orders, kitchen, and payments should surface current state, elapsed urgency where available, and the safest next action before secondary details.
- Trust checklist: landing/auth/payment copy must be accurate; do not add fake testimonials, fake metrics, fake payment readiness, or fake realtime claims.

## Module 48.5 Admin Debt Cleanup QA

- Shop CRUD checklist: shop management should be list-first with search, status filter, drawer create/edit, brand preview, explicit media helper text, empty/no-results states, and delete copy that explains QR menu impact.
- Print station checklist: station management should show shop/type filters, branch scope, default station state, routing summary by station type, drawer create/edit, and delete copy that does not imply old print logs are removed.
- Settings checklist: settings should be grouped into identity, branding, billing defaults, and notifications, with a visible selected shop, owner-only edit state, brand preview, and sticky save action for long forms.
- Media checklist: logo and cover uploads need readable labels, replacement guidance, and preview/context where existing assets are already saved.
- Admin mobile checklist: drawers must remain one-column, footer actions reachable, toolbar filters wrap cleanly, tables scroll inside their container, and preview panels stack below the primary list.
- Bilingual readiness checklist: new admin copy should have Khmer and English keys even when a page still needs a later wiring pass to `useLanguage`.
- Regression checklist: preserve existing API payloads, Telegram test action, multipart upload behavior, permission checks, and destructive confirmation flow.

## Module 48 Research-Inspired UI System QA

- Shared-component checklist: start with `AppButton`, `AppCard`, form controls, state components, table wrappers, metric cards, page headers, drawers, and command palette before page-level styling.
- Inspiration-use checklist: use Stripe/Vercel/QR ordering/POS references only for principles such as hierarchy, focus states, spacing, and status visibility; do not copy layouts, text, assets, or brands.
- System-status checklist: loading, empty, no-results, offline, realtime, success, and error states must be visible in text and not rely on color alone.
- Button checklist: buttons need consistent height, icon spacing, pressed state, disabled state, loading state, focus ring, and safe destructive styling.
- Card/header checklist: card and page-header actions should wrap on mobile without squeezing text or hiding primary actions.
- Form checklist: labels, helper text, errors, uploads, and toggles should remain readable in English and Khmer with stable focus rings.
- Command palette checklist: route jumping must be described honestly, dialog title/description must be present, Escape closes, and keyboard focus remains clear.
- Realtime checklist: connected, reconnecting, paused, unavailable, and error states must show readable text, tooltips, and nonessential motion only.
- Customer QR checklist: preserve large tap targets, sticky cart visibility, offline submit blocking, payment-proof safety, and simple status copy.
- Performance checklist: verify route lazy loading, chart lazy loading, dynamic Echo/Pusher, dynamic SweetAlert2, PWA/offline behavior, and no large chunk warning after UI changes.

## Module 49 Landing, Shell, and Centered CRUD QA

- Landing hero checklist: first screen should clearly explain MenuDIGI, show a primary "Get started" action, show a QR menu demo action, keep the language toggle visible, and avoid fake testimonials or fake metrics.
- Sidebar grouping checklist: verify Overview, Operations, Catalog, Business, and Settings groups remain permission-aware, active links are readable, icons align consistently, and no existing routes are removed.
- Navbar command checklist: command/search affordance must say "Jump to page or action", behave as a button, stay keyboard accessible, and never imply backend record search.
- Centered CRUD modal checklist: category, product, branch, and table create/edit should open centered dialogs with accessible titles, descriptions, close buttons, Escape close, sticky footer, and save/cancel hierarchy.
- Mobile modal checklist: at 375px and 430px, modal body should scroll without hiding footer actions, fields should remain one column, and long Khmer labels should wrap naturally.
- Form accessibility checklist: every input needs a label, helper/error copy should be readable, required state should be visible, and upload controls should keep clear focus rings.
- Empty/no-results action checklist: first-time empty states should expose the safe Add action when permissions allow, while filtered no-results should offer Clear filters.
- Performance checklist: do not add heavy UI libraries, charts, global realtime imports, or global SweetAlert2 imports while polishing landing, shell, or CRUD modal UI.

## Module 50 Khmer-First Typography QA

- Khmer OS Battambang checklist: global font stack should include `Inter, "Khmer OS Battambang", "Noto Sans Khmer", system-ui, sans-serif` without committing font binaries.
- Khmer line-height checklist: body Khmer text should breathe around 1.75, headings around 1.4, labels around 1.55, and buttons around 1.4.
- Khmer uppercase checklist: when `html[lang="km"]` is active, uppercase utility styling should not force Khmer labels into all-caps or tracked letter spacing.
- Khmer wrapping checklist: page titles, navbar labels, modal helpers, form labels, customer menu labels, and buttons should wrap naturally at 375px and 430px.
- Page title checklist: each major feature should have a clear title, helpful subtitle, and action-led primary CTA in English and Khmer.
- Landing hero checklist: hero copy should explain the QR menu, ordering, and payment system quickly in both languages without fake metrics or copied marketing claims.
- Sidebar/navbar checklist: grouped navigation and command trigger must remain permission-aware, keyboard accessible, and readable in Khmer.
- Centered CRUD modal checklist: modal title, helper copy, labels, errors, and footer buttons must remain readable in Khmer and English.
- Form accessibility checklist: labels remain at least 14px-15px equivalent, helper text is readable, focus rings remain visible, and disabled/loading states are clear.
- Performance checklist: typography changes must not add font binaries, new UI libraries, global chart imports, global realtime imports, or large bundle warnings.

## Module 52 Full-Feature Refinement QA

- Khmer typography: verify body line-height, heading rhythm, natural wrapping, and no forced uppercase/tracking at every major breakpoint.
- Sidebar scroll: verify desktop navigation scrolls independently and the bottom workspace card remains reachable; verify the mobile drawer opens, closes, and dismisses after route selection.
- Navbar page title: verify every admin route shows the correct title/workflow context and the command trigger never implies backend record search.
- Centered CRUD modal: verify Add/Edit opens an accessible centered dialog with description, close control, Escape behavior, and sticky save/cancel footer.
- Mobile modal: verify one-column form flow and reachable footer actions at 375 px and 430 px without horizontal overflow.
- Empty-state action: verify first-time states offer one safe primary action and filtered no-results offer a clear-filter action.
- API loading/retry state: verify skeletons preserve layout, previous data remains visible during refresh, timeout copy is actionable, and errors offer retry without raw server details.
- Customer QR tap target: verify product, category, quantity, cart, checkout, payment, and proof controls remain comfortable for one-handed use.
- i18n hardcoded strings: switch landing, admin shell, CRUD forms, public menu, cart, payment, and order-success flows to Khmer and record any remaining English-only operational copy.

## Module 53 Modern-Clean Polish QA

- Shared controls: verify 44px input/select height, readable textarea sizing, restrained shadows, consistent radii, and visible focus/disabled/error states.
- Khmer buttons: verify long labels wrap naturally, retain comfortable line height, and do not become narrow or clipped.
- Auth: verify login/register remain centered and scannable, password visibility is keyboard accessible, validation is readable, and reset messaging does not imply a missing backend feature exists.
- Dashboard hierarchy: verify today's real metrics, needs-attention items, and next actions remain distinct without fake data.
- CRUD: verify simple editors remain centered, busy saves cannot be dismissed accidentally, and no permanent two-column form returns.
- Operations: verify status actions, realtime state, payment proof, confirmations, and mobile tap targets remain obvious and permission-aware.
- Reports: verify filter controls remain usable on mobile, existing data remains visible during refresh, chart descriptions are present, and charts stay outside landing/public bundles.
- Customer QR: verify localized product status, quantity controls, cart visibility, checkout, proof preview, order timeline, offline blocking, and install/update prompts.
- Motion: verify hover/press/modal/cart transitions stay within roughly 150–250ms and respect reduced-motion behavior where implemented.
- Regression: run backend tests, frontend lint/tests/build, route listing, and `git diff --check`; confirm Vitest excludes Playwright files.

## Module 54 Responsive Modern UI QA

- Breakpoint review: inspect 375px, 430px, 768px, 1024px, and 1440px layouts without treating tablet or mobile as compressed desktop screens.
- Shell review: confirm the mobile navbar keeps the page title readable, secondary actions collapse safely, popup panels remain within the viewport, and sidebar navigation scrolls independently on desktop.
- Modal review: confirm CRUD and customer dialogs use the dynamic viewport height, prevent horizontal overflow, scroll internally, and keep full-width mobile footer actions reachable above safe-area insets.
- Toolbar/table review: confirm search is at least 44px high, filters/actions wrap, tables scroll only inside a labeled region, and the page itself has no horizontal overflow.
- Customer review: confirm sticky cart and product-detail actions stack at narrow widths, do not cover content, and account for device safe areas.
- Empty-state review: confirm primary and secondary actions become full-width on mobile while descriptions and Khmer copy wrap naturally.
- Performance review: preserve route splitting, admin-only chart chunks, PWA behavior, reduced-motion support where present, and the Vitest/Playwright collection boundary.

## Module 55 Real-Device and Khmer Mobile Hardening QA

- Breakpoint artifacts: capture 375, 390, 430, 768, 1024, and 1440 px browser views; identify browser emulation separately from physical-device testing.
- Safe-area review: verify `viewport-fit=cover`, modal/sheet footers, sticky cart, checkout actions, and full-height navigation account for relevant environment insets.
- Khmer font review: on devices with Khmer OS Battambang installed, confirm it wins in Khmer mode; otherwise confirm Noto Sans Khmer fallback, natural wrapping, and comfortable heading/button/label/body line height.
- Customer review: verify shop/table context, 44 px category and quantity targets, required-option feedback, stacked sticky cart/product actions, bounded proof previews, and an unobstructed order timeline.
- Admin review: verify bounded navbar popovers, independently scrolling navigation, discoverable mobile Add actions, one-column centered CRUD forms, contained table scrolling, and charts with no page-level overflow.
- State review: verify loading skeletons preserve layout, empty/error actions remain visible, retry copy is clear, and refetches do not produce blank screens.
- Accessibility review: verify dialog/sheet naming, icon-button labels, upload labels, quantity labels, table scroll-region names, language state, and text equivalents for statuses.
- Browser review: run both full Playwright E2E and the visual artifact command when Chrome is stable; do not commit large reports, traces, videos, or screenshot outputs.
- Manual device TODO: test iOS Safari and Android Chrome with long Khmer catalog data, keyboard-open forms, display zoom, notch/home indicator, and installed-PWA mode.

## Module 55.1 Admin Shell, Account Menu, and Settings QA

- Navbar density: keep the sticky shell around 64–72 px, use a small route icon and compact context, bound the route/action command trigger, and prevent the user trigger from becoming the dominant control.
- Title hierarchy: navbar context stays compact while the page body owns the primary heading, subtitle, and action hierarchy.
- Account menu: constrain the panel to roughly 320–360 px and the viewport, show compact profile details, use permission-aware existing links, keep language switching segmented, and style logout as a restrained danger outline.
- Account accessibility: preserve click-outside/Escape dismissal, `aria-expanded`, popup semantics, visible keyboard focus, readable logout text, and non-color status text.
- Language toggle: preserve `aria-pressed`, natural Khmer wrapping, Khmer font inheritance, equal compact segments, and safe width in sidebar/account contexts.
- Settings rhythm: place the workspace selector close to the page header, use existing supported fields only, group content into profile/branding/operations-notifications, and keep section navigation locally scrollable on narrow screens.
- Settings actions: provide clear Cancel/Save hierarchy without allowing a sticky footer to cover fields; keep mobile actions full width and safe-area aware.
- Settings recovery: when no shop exists, explain the prerequisite and provide one action to the existing Shops route.
- Responsive review: capture `/admin/settings` and its account menu at 375, 430, 768, 1024, and 1440 px in English and Khmer where practical.

## Module 56 Premium Overview Dashboard QA

- Overview hierarchy: /admin should read as Overview, with one page h1, a short operations subtitle, refresh, reports, live status, last-updated, and no route change.
- Five-second scan: the first screen should answer today’s sales/orders, what needs attention, and the next action without competing card noise.
- KPI checklist: cards should have stable height, clear labels, large tabular numbers, helper text, empty states, no fake trends, and restrained tone colors.
- Needs-attention checklist: each item should state the problem, why it matters, and one action; the empty state must not imply unverified backend data.
- Quick-actions checklist: actions must link to existing routes, respect permissions where available, and wrap from one column to multi-column layouts cleanly.
- Operations snapshot checklist: recent orders, pending payments, and kitchen queue should show safe details, text status badges, empty states, and action links.
- Analytics preview checklist: charts need title, description, loading/empty states, reports links, bounded mobile height, and continued lazy chart loading.
- Refetch checklist: first load may skeleton; manual refresh must keep previous data visible and show “Refreshing overview...” plus last updated when available.
- Khmer checklist: overview title/subtitle, KPI labels, action cards, empty states, and statuses must wrap naturally without forced uppercase or letter spacing.
- Performance checklist: do not add UI libraries, do not import Recharts outside lazy chart modules, and preserve public/landing bundle protection.

## Module 57 Account/Profile, Notifications, and Settings Completion QA

- Account profile checklist: profile must load from authenticated API data, email stays read-only until verified email change exists, role/status are visible but not self-editable, and password change requires current password.
- Preference checklist: language, timezone, date format, dashboard range, and notification preferences must save to real account preference data and show validation errors clearly.
- Notification checklist: navbar badge, dropdown, and notification page must use real notification logs only; empty states must not imply fake activity.
- Notification security checklist: notification list, unread count, mark read, and mark all read must stay scoped to accessible shops/branches and per-user read state.
- Account menu checklist: Profile, Shop Settings, System Health, Notifications, and Logout must link only to real routes, with settings/system health permission-aware.
- Settings checklist: active controls must map to backend-supported save fields; unsupported payment toggles or merchant secrets must not appear as editable UI.
- Completion score checklist: score must use saved shop/profile, branch, category, product, table QR, Telegram, and public menu readiness data only.
- Khmer checklist: account, notification, settings, and completion labels must read naturally, wrap cleanly, and avoid forced uppercase.
- Regression checklist: preserve auth, roles, tenant authorization, public ordering, reports, PWA behavior, API security, and route lazy loading.

## Module 58 Notification Automation, Payment Settings, and Account Activity QA

- Notification automation checklist: order creation, payment proof upload, payment confirmation, and payment rejection should write real notification logs without fake generation.
- Notification payload checklist: notification API responses must exclude proof paths, provider secrets, raw provider payloads, tokens, and customer private data not needed for the admin action.
- Account activity checklist: profile updates, password changes, preference changes, login, blocked login, and logout should log safe activity visible only to the current user.
- Payment settings checklist: cash, ABA/manual KHQR, Bakong, proof upload requirement, auto-confirm cash, instructions, and QR label must save through the backend settings contract.
- Public payment checklist: disabled methods should not appear in public payment choices and should be rejected if submitted directly.
- Settings completion checklist: payment method readiness and branding basics should use saved settings/shop data only.
- Notification UX checklist: navbar dropdown needs loading, error retry, empty state, latest notifications, mark all read, and view-all link; page needs filters and load more where available.
- Khmer checklist: event types, account activity, payment settings, and notification controls must remain natural and readable without forced uppercase.
- Regression checklist: preserve tenant scoping, branch scoping, auth, public ordering, reports, PWA behavior, route lazy loading, and no new UI libraries.

## Module 59 Premium UX/UI System QA

- Shared system checklist: refine `AppButton`, `Button`, `Input`, `Select`, `Textarea`, `AppCard`, `AppPageHeader`, `AppTable`, `AppSheet`, `CrudFormModal`, state components, language toggle, and realtime status before page-specific styling.
- Khmer readability checklist: avoid forced uppercase/tracking in edited labels, keep controls at comfortable tap height, and allow long Khmer labels/buttons to wrap naturally.
- Shell checklist: sidebar remains permission-aware and independently scrollable, navbar remains compact, account/notification popovers stay bounded, and notification count/logs remain real.
- Landing/auth checklist: keep the first impression clean, bilingual, and honest without fake testimonials, fake metrics, missing reset-password promises, or chart imports.
- Dashboard/settings/account checklist: keep one body h1, clear page subtitle/actions, real completion data, honest payment readiness, real notifications, and profile/password forms tied to existing APIs.
- CRUD checklist: simple create/edit stays in centered modals, tables use labeled scroll regions, mobile forms remain one-column, and empty/no-results states provide safe actions.
- Operations/reports checklist: preserve drawers for complex details, real realtime status, proof-review safety, lazy charts, export behavior, and no private payment/customer data exposure.
- Customer QR checklist: product cards, option sheets, sticky cart, checkout, payment, proof preview, order success/status, offline, and PWA prompts must remain mobile-first and safe-area aware.
- Accessibility checklist: icon buttons need labels, dialogs/sheets need names, language toggle needs `aria-pressed`, statuses need text, uploads need labels, and focus rings remain visible.
- Performance checklist: no new UI libraries, no global chart/realtime/alert imports, preserve route splitting, PWA behavior, Vitest/Playwright separation, and production build health.
- QA checklist: run backend tests, route list, frontend lint/test/build, `git diff --check`, and optional Playwright E2E/visual checks when Chrome is stable.

## Module 60 Ultra-Premium Visual System QA

- Premium surface checklist: cards, tables, metric panels, sheets, modals, customer cards, and sticky bars should share softer depth, restrained borders, and no heavy shadows.
- Visual-noise checklist: reduce decorative gradients where they do not clarify hierarchy; prefer white cards, slate backgrounds, navy text, and blue action accents.
- Micro-interaction checklist: hover lift applies only on desktop/fine pointer, button press feedback stays subtle, modal/sheet motion remains 150ms-250ms, and reduced motion is respected.
- Admin shell checklist: active sidebar state should be elegant and readable, not heavy; navbar remains compact; popovers stay bounded; navigation remains independently scrollable.
- Dashboard checklist: KPI cards, quick actions, needs-attention items, and charts should have generous rhythm, clear hierarchy, real data only, and Khmer-readable labels.
- Customer QR checklist: public header, category tabs, product cards, product sheet, sticky cart, checkout, payment, and timeline should feel mobile-app-like while preserving safe areas.
- State checklist: loading, empty, no-results, error, offline, and refreshing states should be calm, explanatory, action-led, and visually close to the final layout.
- Khmer checklist: avoid uppercase/tracking in edited surfaces, preserve body 1.65-1.8 line height, heading 1.35-1.5 line height, readable form labels, and natural mobile wrapping.
- Accessibility checklist: preserve dialog labels, drawer titles, table scroll region labels, status text, icon button labels, upload labels, and visible keyboard focus.
- Performance checklist: no new UI libraries, no landing/public chart imports, preserve lazy routes/charts, PWA behavior, dynamic realtime/alerts, and Vitest/Playwright separation.
- Final-check checklist: run backend tests, route list, frontend lint/test/build, `git diff --check`, and document optional E2E/visual routes if not run.
