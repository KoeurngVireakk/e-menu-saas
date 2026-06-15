# Telegram Staff Notifications

Module 24 adds tenant-aware Telegram notification foundations for shops, restaurants, cafes, and clubs.

## Events

Telegram notifications can be sent or sandbox-logged for:

- `order.created`: new customer order
- `payment.proof_uploaded`: manual KHQR proof uploaded
- `payment.paid`: Bakong KHQR paid by verified webhook
- `payment.failed`: payment rejected, failed, expired, or mismatched
- `invoice.paid`: invoice marked paid

Messages include operational details only: shop, branch, order/invoice number, item summary, totals, provider reference, status, and admin URLs where useful. They do not include bot tokens, proof image file paths, private storage paths, or raw webhook secrets.

## Create A Telegram Bot

1. Open Telegram and search for `BotFather`.
2. Run `/newbot`.
3. Follow the prompts for bot name and username.
4. Store the bot token securely in production environment secrets.

Never commit a real bot token.

## Get Chat ID

For a private chat:

1. Send a message to your bot.
2. Use Telegram `getUpdates` or a safe internal tool to read the chat ID.

For a group:

1. Add the bot to the group.
2. Send a message in the group.
3. Read the group chat ID from `getUpdates`.

Store the chat ID per shop in admin settings.

## Environment Setup

Backend `.env`:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_ENABLED=false
TELEGRAM_SANDBOX_MODE=true
```

`TELEGRAM_SANDBOX_MODE=true` writes notification logs without sending real Telegram messages. This is the recommended local and CI mode.

## Shop Settings

Each shop can configure:

- Telegram enabled
- Telegram chat ID
- order notifications enabled
- payment notifications enabled
- invoice notifications enabled

Managers can view tenant settings if allowed by role. Only super admins and shop owners can edit notification settings or send test messages.

## Test Notification

Admin settings includes a `Test Telegram` button. In sandbox mode, this creates a `notification_logs` row with status `sent` and metadata indicating sandbox behavior. In production mode, it calls Telegram through Laravel HTTP client.

## Notification Logs

Notification outcomes are stored in `notification_logs`:

- `sent`
- `failed`
- `skipped`

Skipped logs explain whether Telegram was disabled globally, disabled for the shop, missing a chat ID, or disabled for the event type.

## Security Notes

- Do not log bot tokens.
- Do not log full webhook headers.
- Do not send proof image paths or private filesystem paths.
- Keep chat IDs tenant-specific by shop.
- Use sandbox mode until production credentials and chat routing are verified.

## Troubleshooting

- If logs show `Telegram is disabled globally`, set `TELEGRAM_ENABLED=true`.
- If logs show `Telegram is disabled for this shop`, enable Telegram in `/admin/settings`.
- If logs show missing chat ID, confirm the correct Telegram chat ID.
- If production sending fails, check bot token, bot membership in the group, and network access from the backend.
