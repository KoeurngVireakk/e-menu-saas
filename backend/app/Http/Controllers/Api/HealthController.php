<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array($request->user()?->role, ['super_admin', 'shop_owner'], true), 403);

        return $this->success('System health loaded', [
            'health' => [
                'app' => [
                    'status' => 'ok',
                    'environment' => app()->environment(),
                    'version' => config('app.version'),
                ],
                'database' => $this->databaseStatus(),
                'cache' => $this->cacheStatus(),
                'queue' => $this->queueStatus(),
                'storage' => $this->storageStatus(),
                'checked_at' => now()->toISOString(),
            ],
        ]);
    }

    private function databaseStatus(): array
    {
        try {
            DB::connection()->getPdo();

            return ['status' => 'ok'];
        } catch (\Throwable $exception) {
            return ['status' => 'error', 'message' => 'Database connection failed'];
        }
    }

    private function cacheStatus(): array
    {
        try {
            $key = 'system_health_probe';
            Cache::put($key, 'ok', now()->addSeconds(10));

            return [
                'status' => Cache::get($key) === 'ok' ? 'ok' : 'warning',
                'driver' => config('cache.default'),
            ];
        } catch (\Throwable $exception) {
            return [
                'status' => 'error',
                'driver' => config('cache.default'),
                'message' => 'Cache probe failed',
            ];
        }
    }

    private function queueStatus(): array
    {
        return [
            'status' => 'available',
            'connection' => config('queue.default'),
        ];
    }

    private function storageStatus(): array
    {
        try {
            $disk = Storage::disk('public');
            $probePath = 'health/system-health-probe.txt';
            $disk->put($probePath, 'ok');
            $readable = $disk->get($probePath) === 'ok';
            $disk->delete($probePath);

            return [
                'status' => $readable ? 'ok' : 'warning',
                'disk' => 'public',
                'readable' => $readable,
                'writable' => true,
            ];
        } catch (\Throwable $exception) {
            return [
                'status' => 'error',
                'disk' => 'public',
                'readable' => false,
                'writable' => false,
                'message' => 'Public storage probe failed',
            ];
        }
    }
}
