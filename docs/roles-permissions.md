# Roles and Permissions

Module 19 adds permission-aware admin UI controls while keeping Laravel authorization as the source of truth.

## Roles

- `super_admin`: platform-level administrator with all permissions.
- `shop_owner`: owner of one or more shops with full permissions for owned shops.
- `manager`: operational manager for assigned shops or branches.
- `cashier`: payment and order operator for assigned shop/branch scope.
- `waiter`: order and table-service operator for assigned branch scope.

## Frontend Feature Matrix

| Feature | super_admin | shop_owner | manager | cashier | waiter |
| --- | --- | --- | --- | --- | --- |
| Dashboard | View | View | View | View | View |
| Shops/settings | Manage | Manage | - | - | - |
| Branches | Manage | Manage | Manage | - | - |
| Categories | Manage | Manage | Manage | - | - |
| Products/options | Manage | Manage | Manage | - | - |
| Table QR | Manage | Manage | Manage | - | View |
| Orders | Manage | Manage | Manage | Manage | Manage |
| Payments | Manage | Manage | Manage | Manage | - |
| System Health | View | View | - | - | - |

`frontend/src/utils/permissions.js` controls sidebar filtering, route-level 403 pages, and action-level button visibility.

## Backend Source of Truth

Frontend permissions only improve user experience. They do not secure the API.

Laravel controllers still enforce authorization for:

- shop ownership and staff assignment scope
- catalog writes
- branch writes
- table writes
- order status updates
- payment confirmation and rejection
- system health access

If frontend and backend ever disagree, backend behavior wins.

## Staff Scope

Staff access is scoped through `shop_staff` assignments:

- `branch_id = null` means the staff member can access all branches in that shop.
- a concrete `branch_id` limits the staff member to that branch.
- unrelated shops remain forbidden.

## Future Custom Permission System

For larger enterprise tenants, replace hard-coded role rules with a custom permission system:

- `permissions` table for atomic permissions.
- `role_permissions` table for defaults.
- `user_permissions` or `staff_permissions` table for per-user overrides.
- admin UI for assigning and auditing permission changes.
- policy classes or gates for Laravel enforcement.

Until then, keep role checks centralized in the frontend permission helper and Laravel user/controller authorization helpers.
