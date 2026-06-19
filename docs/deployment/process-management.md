# Process Management

Production MenuDIGI needs separate long-running processes for HTTP, queues, scheduling, and realtime.

## Required Processes

- Web server and PHP-FPM for Laravel API.
- Static frontend host for Vite build output.
- Queue worker for async jobs.
- Scheduler for periodic tasks.
- Reverb server for realtime operations.

## Queue Worker

```ini
[program:menudigi-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/menudigi/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/menudigi/worker.log
stopwaitsecs=3600
```

Restart workers after deploy:

```bash
php artisan queue:restart
```

## Scheduler

Cron example:

```cron
* * * * * cd /var/www/menudigi/backend && php artisan schedule:run >> /var/log/menudigi/scheduler.log 2>&1
```

## Reverb

Supervisor example:

```ini
[program:menudigi-reverb]
command=php /var/www/menudigi/backend/artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/menudigi/reverb.log
stopwaitsecs=20
```

Use TLS/WSS at the reverse proxy in production.

## Environment Keys

- `QUEUE_CONNECTION=database` or `redis`.
- `CACHE_STORE=database`, `redis`, or another production-ready store.
- `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`.
- `REVERB_SERVER_HOST`, `REVERB_SERVER_PORT`.
- `APP_VERSION`, `APP_COMMIT`.

## Permissions

- Web process must write to `backend/storage` and `backend/bootstrap/cache`.
- Uploaded media lives under `backend/storage/app/public`.
- Run `php artisan storage:link` after provisioning.
- Do not give web users write access to source code directories beyond required Laravel writable paths.
