# Staff Management

Module 20 adds tenant-level staff management and shop settings for the E-Menu SaaS admin.

## Role Model

Supported admin roles:

- `super_admin`: can manage all shops, staff, and settings.
- `shop_owner`: can manage staff and settings for owned shops.
- `manager`: can view staff and settings for assigned shops or branches, but cannot add, edit, disable, or delete staff.
- `cashier`: can work with orders/payments only; cannot manage staff.
- `waiter`: can work with orders/table service only; cannot manage staff.

Backend authorization remains the source of truth. Frontend permission checks only hide controls and improve the user experience.

## Adding Staff

Shop owners and super admins can add staff from `/admin/staff`.

They can:

- select a shop
- enter an existing user email
- create a new staff user by entering name, email, phone, role, and branch assignment
- assign `manager`, `cashier`, or `waiter`
- assign staff to all branches or one branch
- activate or deactivate staff

The staff UI does not allow assigning `super_admin` or `shop_owner` roles.

## Temporary Passwords

When a new user is created, the API returns a generated temporary password once.

Important handling rules:

- The temporary password is shown once in the admin UI.
- It is not written to audit logs.
- It is not returned again by staff detail/list endpoints.
- Share it securely and ask the staff member to change it later when password change support is added.

## Tenant Settings

Shop owners and super admins can edit `/admin/settings`.

Current settings:

- shop name
- phone
- email
- address
- description
- logo
- cover
- primary color
- secondary color
- currency code
- order auto-accept
- service charge percentage
- tax percentage

Managers can view settings for assigned shops, but cannot edit them.

## Audit Logs

Audit entries are created for:

- staff added
- staff updated
- staff disabled
- staff deleted
- shop settings updated

Audit metadata avoids passwords and sensitive payloads.

## Future Recommendation

Replace temporary password onboarding with an email invitation flow:

- create pending staff invite records
- send expiring invite links
- let staff set their own password
- audit invitation acceptance and expiration
- support per-shop custom permissions instead of only global roles
