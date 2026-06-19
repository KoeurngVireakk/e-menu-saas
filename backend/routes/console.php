<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('menudigi:production-check {--expect-production : Fail if APP_ENV is not production}', function () {
    $failures = 0;
    $warnings = 0;

    $check = function (string $label, bool $passes, string $severity = 'critical') use (&$failures, &$warnings) {
        $status = $passes ? 'ok' : ($severity === 'warning' ? 'warning' : 'error');
        $this->line(sprintf('[%s] %s', $status, $label));

        if (! $passes && $severity === 'critical') {
            $failures++;
        }

        if (! $passes && $severity === 'warning') {
            $warnings++;
        }
    };

    $check('APP_ENV is production', app()->environment('production'), $this->option('expect-production') ? 'critical' : 'warning');
    $check('APP_DEBUG is false', config('app.debug') === false);
    $check('APP_KEY is configured', filled(config('app.key')));
    $check('APP_URL is configured', filled(config('app.url')));
    $check('FRONTEND_URL is configured', filled(env('FRONTEND_URL')));
    $check('CORS allowed origins are explicit', ! empty(config('cors.allowed_origins')) && ! in_array('*', config('cors.allowed_origins'), true));
    $check('Queue connection is configured', filled(config('queue.default')) && config('queue.default') !== 'sync', app()->environment('production') ? 'critical' : 'warning');
    $check('Cache store is configured', filled(config('cache.default')));

    try {
        DB::connection()->getPdo();
        $check('Database connection works', true);
    } catch (Throwable) {
        $check('Database connection works', false);
    }

    try {
        $probe = 'production-check/probe.txt';
        Storage::disk('public')->put($probe, 'ok');
        $storageOk = Storage::disk('public')->get($probe) === 'ok';
        Storage::disk('public')->delete($probe);
        $check('Public storage is writable', $storageOk);
    } catch (Throwable) {
        $check('Public storage is writable', false);
    }

    if (config('broadcasting.default') === 'reverb') {
        $check('Reverb app id is configured', filled(config('broadcasting.connections.reverb.app_id')));
        $check('Reverb app key is configured', filled(config('broadcasting.connections.reverb.key')));
        $check('Reverb app secret is configured', filled(config('broadcasting.connections.reverb.secret')));
    } else {
        $check('Realtime broadcaster is Reverb', false, 'warning');
    }

    if ((bool) config('payment.bakong_khqr.enabled')) {
        $check('Bakong merchant id is configured', filled(config('payment.bakong_khqr.merchant_id')));
        $check('Bakong token is configured', filled(config('payment.bakong_khqr.token')));
        $check('Bakong webhook secret is configured', filled(config('payment.bakong_khqr.webhook_secret')));
    } else {
        $check('Bakong production payments are disabled or intentionally sandboxed', true);
    }

    $this->line("Production check completed with {$failures} critical failure(s) and {$warnings} warning(s).");

    return $failures === 0 ? 0 : 1;
})->purpose('Check production environment readiness without printing secret values');

Artisan::command('menudigi:backup-check', function () {
    $failures = 0;
    $warnings = 0;

    $check = function (string $label, bool $passes, string $severity = 'critical') use (&$failures, &$warnings) {
        $status = $passes ? 'ok' : ($severity === 'warning' ? 'warning' : 'error');
        $this->line(sprintf('[%s] %s', $status, $label));

        if (! $passes && $severity === 'critical') {
            $failures++;
        }

        if (! $passes && $severity === 'warning') {
            $warnings++;
        }
    };

    try {
        DB::connection()->getPdo();
        $check('Database connection works for backup source', true);
    } catch (Throwable) {
        $check('Database connection works for backup source', false);
    }

    $check('Public storage directory exists', File::isDirectory(storage_path('app/public')));
    $check('Public storage directory is writable', File::isWritable(storage_path('app/public')));
    $check('Public storage symlink exists', File::exists(public_path('storage')), 'warning');
    $check('BACKUP_DISK is configured', filled(env('BACKUP_DISK')), 'warning');
    $check('BACKUP_RETENTION_DAYS is configured', filled(env('BACKUP_RETENTION_DAYS')), 'warning');
    $check('BACKUP_ENCRYPTION_KEY is configured', filled(env('BACKUP_ENCRYPTION_KEY')), 'warning');

    try {
        $probe = 'backup-check/probe.txt';
        Cache::put($probe, 'ok', now()->addSeconds(10));
        $check('Cache can record backup probe metadata', Cache::get($probe) === 'ok', 'warning');
        Cache::forget($probe);
    } catch (Throwable) {
        $check('Cache can record backup probe metadata', false, 'warning');
    }

    $this->line("Backup check completed with {$failures} critical failure(s) and {$warnings} warning(s).");

    return $failures === 0 ? 0 : 1;
})->purpose('Check backup prerequisites without creating or exporting backups');
