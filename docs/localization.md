# Localization Foundation

Module 21 adds Khmer and English menu localization without replacing the base catalog fields.

## Supported Locales

- `en` English
- `km` Khmer

The public menu accepts `?locale=en` or `?locale=km`. Unsupported or missing locale values fall back to `en`.

## Data Model

Translations are stored beside the base records:

- `shop_translations`
- `category_translations`
- `product_translations`
- `product_option_translations`
- `product_option_value_translations`

Each table has a unique key for the entity ID plus `locale`, so one entity can have one English row and one Khmer row. Base fields on `shops`, `categories`, `products`, `product_options`, and `product_option_values` remain the fallback source.

## Public Menu Behavior

`GET /api/public/shops/{slug}/menu?locale=km` returns:

- `current_locale`
- `supported_locales`
- localized shop name, description, and address
- localized category names
- localized product names and descriptions
- localized option and option value names

If a translation is missing, the API returns the base field. This keeps QR menus usable even while a restaurant is still adding Khmer or English text.

The frontend stores the selected locale in the public menu URL and local storage. The PWA menu cache key also includes the locale so English and Khmer offline menu snapshots do not overwrite each other.

## Admin Workflow

Admins can open `/admin/translations` to manage public menu text.

Allowed roles:

- `super_admin`
- `shop_owner`
- `manager`

Cashiers and waiters cannot edit translations. Backend authorization remains the source of truth; the frontend permission-aware UI only improves the admin experience.

## Cambodia Market Notes

The current localization foundation is designed for Khmer/English restaurant, cafe, and club menus. Currency remains controlled by shop settings, with `KHR` and `USD` expected to be first-class currencies in future pricing and invoice modules.

Recommended future localization work:

- translated invoice templates
- translated payment instructions for ABA PayWay and Bakong KHQR
- localized Telegram notification messages
- Khmer-friendly thermal receipt layout
- optional Chinese language support for tourist-heavy venues

## Adding More Languages Later

To add another language:

1. Add the locale to backend supported locale lists.
2. Add the locale to `frontend/src/utils/localization.js`.
3. Confirm all translation tables allow the locale length.
4. Add public menu and admin translation tests for the new locale.

Do not remove the base catalog fields. They are still required as the safe fallback and as the operational source for staff who have not completed translations.
