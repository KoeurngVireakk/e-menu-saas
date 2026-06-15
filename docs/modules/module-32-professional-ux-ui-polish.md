# Module 32 - Professional UX/UI Polish and CRUD Redesign

## Old UX Problem

Several admin CRUD pages used a permanent two-column pattern where create/edit forms sat beside the list. That layout made pages feel cramped, reduced scanability, and did not match professional SaaS admin workflows.

The first Module 32 pass replaces that pattern on the highest-friction CRUD pages:

- Categories
- Products
- Branches
- Tables / QR operations

## New List-First CRUD Pattern

CRUD pages should now follow this structure:

1. Page header with title, description, and primary action.
2. Toolbar with search, status tabs, filters, view toggle, and clear filters.
3. Main content as a table or card grid.
4. Create/edit forms in a right-side drawer.
5. Details and previews in drawers.
6. Delete/cancel/reject actions through confirmation dialogs.
7. Success and error feedback through toast/SweetAlert strategy.
8. Loading states through skeletons.
9. Empty states with clear next action.

Do not reintroduce permanent side-by-side form/list layouts on admin CRUD pages.

## Drawer And Modal Pattern

Create/edit flows use `CreateEditDrawer`, built on top of the internal `AppSheet` component. Long forms should keep the save/cancel actions fixed at the bottom of the drawer. Product setup uses tabs to reduce cognitive load:

- Basic Info
- Pricing
- Options/Add-ons
- Availability
- Translations

QR table previews also open in a drawer with download, print, and regenerate placeholder actions.

## Components Added

New CRUD helpers:

- `SearchInput`
- `CrudToolbar`
- `StatusTabs`
- `DataViewToggle`
- `CreateEditDrawer`
- `RowActionsMenu`
- `FormControls`

These components are intentionally small wrappers around Tailwind and Module 31 design-system primitives.

## Pages Improved

### Categories

- Replaced permanent form/sidebar with Add Category drawer.
- Added search, status tabs, sort filter, and shop filter.
- Added status badges and row actions.
- Added polished empty/error states.
- Added translation shortcut.

### Products

- Replaced form/list split with list-first catalog.
- Added search, category, branch, availability, status, and shop filters.
- Added table/grid view toggle.
- Added professional product cards with image placeholder, availability, featured, and price states.
- Added large tabbed product drawer.
- Added duplicate workflow using the existing create API.
- Added translation shortcut.

### Branches

- Replaced permanent form/sidebar with Add Branch drawer.
- Added search, status tabs, and shop filter.
- Added map shortcut when a branch has a Google Maps URL.

### Tables / QR

- Replaced permanent form/sidebar with Add Table drawer.
- Moved QR preview into a drawer.
- Added download PNG, print QR, and regenerate placeholder action.
- Added search, status tabs, shop filter, and branch filter.

## Animation Rules

Module 32 keeps animation subtle and uses the existing foundation:

- Page and component transitions should stay around 150ms-300ms.
- Use hover elevation sparingly on cards.
- Drawers should slide in without interrupting task flow.
- Tables should not be heavily animated.
- Motion must not be required to understand the interface.

## Accessibility Checklist

- Icon buttons include accessible labels.
- Forms use visible labels.
- Drawers expose titles.
- Focus rings remain visible.
- Status badges include text and are not color-only.
- Dangerous actions use confirmation.
- Search/filter controls have clear labels or placeholders.

## Manual Review Steps

Review these routes:

- `/admin/categories`
- `/admin/products`
- `/admin/branches`
- `/admin/tables`
- `/admin/dashboard`
- Public menu and cart flow

For each CRUD route:

1. Search records.
2. Switch status filters.
3. Open add drawer.
4. Edit an existing record.
5. Delete with confirmation.
6. Check mobile/tablet layout.

## Testing Checklist

Run:

```bash
cd backend
php artisan test
php artisan route:list

cd ../frontend
npm run lint
npm run test
npm run build

cd ..
git diff --check
```

## Known Limitations

- Orders and payments were already list-first, but their full drawer refactor remains a future polish pass.
- Product option editing still uses the existing JSON format for compatibility. A visual option builder should be a future module.
- Vite may continue warning about a large vendor chunk because chart/table/query libraries are now available in the frontend bundle.
