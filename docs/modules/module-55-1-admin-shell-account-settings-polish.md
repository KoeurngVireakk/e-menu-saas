# Module 55.1 — Admin Shell, Account Menu, and Settings Polish

## Purpose

Module 55.1 refines MenuDIGI's admin navbar, account menu, language control, and Shop Settings hierarchy. It is a presentation and interaction pass only: existing authentication, permissions, routes, settings payloads, public ordering, reports, PWA behavior, and API contracts remain unchanged.

## Screenshot issues found

- The prior navbar used a large route title, wide command control, dominant user trigger, and generous action spacing.
- The account menu gave the language and logout actions too much visual weight.
- Shop Settings repeated a similarly sized title in the navbar and page body, while the workspace selector and section controls pushed the form downward.
- The previous sticky settings action bar could cover form fields at mobile and tablet viewport heights.

## Navbar improvements

- Standardized the sticky navbar to a compact 64 px height with a restrained glass background and subtle slate border.
- Added small workflow-specific route icons and reduced the navbar title to compact context; the page header remains the primary title.
- Bounded the honest route/action command trigger to `max-w-md` and kept a small keyboard hint.
- Collapsed search to an icon below desktop width, compacted notification controls, and added a compact text-accessible realtime indicator.
- Reduced the account trigger to a 36 px avatar plus optional truncated name on wide screens. Its open state uses a light slate fill rather than a permanent blue outline.

## Account dropdown improvements

- Uses a responsive width up to 21rem, rounded corners, a soft border, and a restrained shadow.
- Profile header now fits a 44 px avatar, name, email, and small role label into a compact block.
- Added permission-aware links to existing Shop Settings and System Health routes.
- Language switching uses a full-width compact segmented control.
- Logout is a small danger-outline action rather than a dominant filled button.
- Existing click-outside and Escape dismissal behavior remains; the trigger exposes expanded/dialog state and the panel has an accessible dialog name.

## Language toggle improvements

- Replaced the heavy pill treatment with a compact slate segmented control.
- Active language uses a white surface, blue text, and subtle border/shadow.
- `aria-pressed`, explicit language-change labels, Khmer typography helpers, and mobile width bounds remain intact.
- Compact mode distributes both language actions evenly inside account and mobile navigation contexts.

## Settings page improvements

- Tightened page rhythm so the workspace selector begins closer to the main page header.
- Reorganized existing backend-supported fields into Shop profile, Branding, Operations & billing, and Telegram notifications.
- Replaced separate section pills with a contained, horizontally scrollable segmented section navigator.
- Kept one-column mobile forms and useful two-column tablet/desktop groups.
- Preserved the existing brand preview and permission guidance in a narrower desktop side rail.
- Added a no-shop recovery state that routes authorized users to the existing Shops page.
- Bottom Cancel/Save actions are clearly separated and safe-area aware without overlaying fields; the page-header Save action remains available.

## Responsive and accessibility behavior

- Browser artifacts cover 375, 430, 768, 1024, and 1440 px settings layouts plus English and Khmer account-menu states.
- Navbar titles truncate safely, command controls collapse, dropdown width remains inside the viewport, section navigation scrolls locally, and form groups stack without page-level horizontal overflow.
- The account trigger retains `aria-expanded`, `aria-haspopup`, and focus-visible styling. Notification, menu, and icon controls keep readable labels.
- Realtime status text remains available to assistive technology in compact mode, so the status does not rely only on color.

## Tests added or updated

- Navbar tests cover the 64 px shell, bounded command trigger, profile/email content, responsive dropdown width, permission-aware links, accessible logout, and subtle open state.
- Language tests cover segmented styling, `aria-pressed`, Khmer activation, compact full-width layout, and equal-width actions.
- Realtime tests cover accessible text in compact mode.
- Settings tests cover the main page heading, supported existing fields, improved section hierarchy, scrollable section navigation, and mobile-safe Cancel/Save actions.
- Visual screenshot artifacts now include the Shop Settings route and account menu at the requested viewport widths; generated binaries remain ignored.

## Known limitations and TODOs

- Shop Settings field-level copy remains primarily English; shared page titles and the admin shell respond to Khmer. A broader settings dictionary migration should be handled separately to avoid mixing copy expansion with this layout pass.
- The account menu links to existing shop/system administration routes; there is no personal profile/account backend route to expose.
- Physical-device testing is still recommended for installed Khmer OS Battambang metrics, browser zoom, and mobile keyboard behavior.
