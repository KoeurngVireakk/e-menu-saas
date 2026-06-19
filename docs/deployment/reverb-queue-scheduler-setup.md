# Reverb, Queue And Scheduler Setup

## Queue Worker

Use one of:

- `deploy/supervisor/laravel-worker.conf.example`
- `deploy/systemd/menudigi-worker.service.example`

Recommended command:

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

Run `php artisan queue:restart` after every deployment.

## Scheduler

Use one of:

- `deploy/supervisor/laravel-scheduler.conf.example`
- `deploy/systemd/menudigi-scheduler.service.example`

Recommended command:

```bash
php artisan schedule:work
```

Alternative cron:

```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Use either `schedule:work` or cron, not both.

## Reverb

Use one of:

- `deploy/supervisor/laravel-reverb.conf.example`
- `deploy/systemd/menudigi-reverb.service.example`

Recommended command:

```bash
php artisan reverb:start --host=0.0.0.0 --port=${REVERB_SERVER_PORT}
```

## Environment

Backend:

- `BROADCAST_CONNECTION=reverb`
- `REVERB_APP_ID`
- `REVERB_APP_KEY`
- `REVERB_APP_SECRET`
- `REVERB_HOST`
- `REVERB_PORT`
- `REVERB_SCHEME`
- `REVERB_SERVER_HOST`
- `REVERB_SERVER_PORT`

Frontend:

- `VITE_REVERB_APP_KEY`
- `VITE_REVERB_HOST`
- `VITE_REVERB_PORT`
- `VITE_REVERB_SCHEME`

## Smoke Checks

- Admin realtime badge should connect.
- Creating an order should broadcast to operations surfaces.
- Payment confirmation should broadcast without a page refresh.
- Queue worker logs should not show repeated failures.
- Scheduler process should stay active or cron should run each minute.

## Operations Notes

- Keep Reverb behind HTTPS/WSS in production.
- Restart Reverb after env changes.
- Use Redis for queues in production.
- Monitor failed jobs and worker memory.
