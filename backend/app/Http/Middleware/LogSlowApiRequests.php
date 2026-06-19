<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogSlowApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = microtime(true);

        /** @var Response $response */
        $response = $next($request);

        $threshold = (int) config('app.api_slow_log_ms', 500);
        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        if ($threshold > 0 && $request->is('api/*')) {
            if ($durationMs >= $threshold) {
                Log::warning('Slow API request', [
                    'method' => $request->method(),
                    'route' => $request->route()?->uri(),
                    'status' => $response->getStatusCode(),
                    'duration_ms' => $durationMs,
                    'user_id' => $request->user()?->id,
                ]);
            }
        }

        if (config('app.api_timing_headers', false) && $request->is('api/*')) {
            $response->headers->set('X-Request-Time-Ms', (string) $durationMs);
        }

        return $response;
    }
}
