# Backup And Restore

This runbook defines the production backup and restore strategy for MenuDIGI.

## Backup Scope

Back up:

- MySQL database.
- `storage/app/public` uploaded media.
- Product images, category images, shop logos/covers, and payment proof images.
- Deployment metadata such as release commit and migration batch.

Do not commit or include in application backups:

- `.env` files.
- Payment provider secrets.
- Telegram bot tokens.
- Database passwords.
- Raw access tokens.

Logs are not primary backups, but retain them separately for incident review.

## MySQL Backup

Use environment placeholders, not literal secrets:

```bash
mysqldump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  -u "$DB_USERNAME" \
  -p"$DB_PASSWORD" \
  "$DB_DATABASE" > "menudigi-db-$(date +%Y%m%d%H%M%S).sql"
```

## MySQL Restore

Restore only after confirming the target database and maintenance window:

```bash
mysql -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < menudigi-db-YYYYMMDDHHMMSS.sql
php artisan migrate --force
php artisan config:cache
php artisan queue:restart
```

## Storage Backup

```bash
tar -czf "menudigi-storage-$(date +%Y%m%d%H%M%S).tar.gz" storage/app/public
```

## Storage Restore

```bash
tar -xzf menudigi-storage-YYYYMMDDHHMMSS.tar.gz
php artisan storage:link
```

## Retention

- Keep daily backups for `BACKUP_RETENTION_DAYS`.
- Keep weekly backups for at least 4 weeks.
- Keep monthly backups according to business and legal requirements.

## Encryption And Offsite Storage

- Encrypt backups before offsite transfer.
- Store backups outside the app server, such as S3-compatible storage or a managed backup vault.
- Restrict backup access to production operators only.
- Rotate `BACKUP_ENCRYPTION_KEY` using a planned re-encryption procedure.

## Restore Drill

Run a restore drill at least monthly:

- Restore latest database backup into a non-production environment.
- Restore uploaded media.
- Run `php artisan migrate --force`.
- Run `php artisan menudigi:backup-check`.
- Verify `/api/health/ready`.
- Open public menu and admin dashboard.
- Submit a test order in the drill environment only.

## Emergency Restore

1. Put the application in maintenance mode.
2. Snapshot the current failed state if possible.
3. Restore database backup.
4. Restore storage backup.
5. Run migrations.
6. Clear and rebuild Laravel caches.
7. Restart queue workers and Reverb.
8. Check `/api/health/live` and `/api/health/ready`.
9. Run smoke tests.
10. Disable maintenance mode.
