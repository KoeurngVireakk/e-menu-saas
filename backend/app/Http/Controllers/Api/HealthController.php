<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    public function public()
    {
        return $this->success('API health loaded', $this->basePayload('ok'));
    }

    public function live()
    {
        return $this->success('Application is alive', $this->basePayload('ok'));
    }

    public function ready()
    {
        $checks = [
            'database' => $this->databaseStatus(),
            'cache' => $this->cacheStatus(public: true),
            'storage' => $this->storageStatus(public: true),
        ];
        $ready = collect($checks)->every(fn (array $check) => $check['status'] === 'ok');
        $status = $ready ? 'ok' : 'not_ready';

        return response()->json([
            'success' => $ready,
            'message' => $ready ? 'Application is ready' : 'Application is not ready',
            'data' => $this->basePayload($status) + [
                'checks' => $checks,
            ],
        ], $ready ? 200 : 503);
    }

    public function index(Request $request)
    {
        abort_unless(in_array($request->user()?->role, ['super_admin', 'shop_owner'], true), 403);

        return $this->success('System health loaded', [
            'health' => [
                'app' => [
                    'status' => 'ok',
                    'environment' => app()->environment(),
                    'version' => config('app.version'),
                    'commit' => config('app.commit'),
                ],
                'database' => $this->databaseStatus(),
                'cache' => $this->cacheStatus(),
                'queue' => $this->queueStatus(),
                'storage' => $this->storageStatus(),
                'checked_at' => now()->toISOString(),
            ],
        ]);
    }

    private function basePayload(string $status): array
    {
        return [
            'status' => $status,
            'app' => config('app.name'),
            'timestamp' => now()->toISOString(),
            'version' => config('app.version'),
            'commit' => config('app.commit'),
        ];
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

    private function cacheStatus(bool $public = false): array
    {
        try {
            $key = 'system_health_probe';
            Cache::put($key, 'ok', now()->addSeconds(10));

            $status = Cache::get($key) === 'ok' ? 'ok' : 'warning';

            return $public
                ? ['status' => $status]
                : ['status' => $status, 'driver' => config('cache.default')];
        } catch (\Throwable $exception) {
            return $public ? ['status' => 'error', 'message' => 'Cache probe failed'] : [
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

    private function storageStatus(bool $public = false): array
    {
        try {
            $disk = Storage::disk('public');
            $probePath = 'health/system-health-probe.txt';
            $disk->put($probePath, 'ok');
            $readable = $disk->get($probePath) === 'ok';
            $disk->delete($probePath);

            return $public ? [
                'status' => $readable ? 'ok' : 'warning',
                'readable' => $readable,
                'writable' => true,
            ] : [
                'status' => $readable ? 'ok' : 'warning',
                'disk' => 'public',
                'readable' => $readable,
                'writable' => true,
            ];
        } catch (\Throwable $exception) {
            return $public ? [
                'status' => 'error',
                'readable' => false,
                'writable' => false,
                'message' => 'Public storage probe failed',
            ] : [
                'status' => 'error',
                'disk' => 'public',
                'readable' => false,
                'writable' => false,
                'message' => 'Public storage probe failed',
            ];
        }
    }
}
