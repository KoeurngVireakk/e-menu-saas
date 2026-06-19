# Monitoring And Logging

This guide describes production monitoring expectations for MenuDIGI.

## Log Sources

- Laravel app logs: `backend/storage/logs/laravel.log` or configured daily log files.
- Queue worker logs from Supervisor, systemd, or platform process logs.
- Scheduler logs from cron or systemd timers.
- Reverb logs from the websocket process manager.
- Web server logs from Nginx/Apache/Caddy.
- PHP-FPM logs.
- Frontend build logs from CI/CD.
- Payment webhook logs from Laravel payment logs and application logs.
- Audit logs from the `audit_logs` database table.

## Never Log

- Passwords.
- API tokens.
- Authorization headers.
- Payment provider secrets.
- Telegram bot tokens.
- Raw proof image binary data.
- Raw webhook secrets.
- Full `.env` contents.

## Recommended Alerts

- `/api/health/ready` returns non-200.
- Queue worker stopped or failed jobs increasing.
- Scheduler did not run recently.
- Reverb process stopped or websocket error rate increases.
- Database connection failure.
- High HTTP 500 rate.
- Payment webhook failures or signature failures spike.
- Disk usage above 80 percent.
- Backup failed or backup age exceeds policy.
- Log volume suddenly increases.

## Review Cadence

- Daily: health checks, failed jobs, payment failures.
- Weekly: storage growth, log rotation, backup success.
- Monthly: restore drill and access review.

## Operational Notes

- Keep `APP_DEBUG=false` in production.
- Prefer daily logs or centralized logging in production.
- Retain audit logs according to compliance and business needs.
- Use synthetic monitoring for public menu and login routes.
