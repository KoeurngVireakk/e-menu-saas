<?php

namespace Tests\Feature;

use App\Http\Middleware\LogSlowApiRequests;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class ApiTimingDiagnosticsTest extends TestCase
{
    public function test_api_timing_header_is_applied_when_enabled(): void
    {
        config(['app.api_timing_headers' => true]);

        $this->getJson('/api/health')
            ->assertOk()
            ->assertHeader('X-Request-Time-Ms');

        $headerValue = $this->getJson('/api/health')->headers->get('X-Request-Time-Ms');
        $this->assertIsNumeric($headerValue);
    }

    public function test_api_timing_header_is_absent_when_disabled(): void
    {
        config(['app.api_timing_headers' => false]);

        $this->getJson('/api/health')
            ->assertOk()
            ->assertHeaderMissing('X-Request-Time-Ms');
    }

    public function test_slow_request_middleware_does_not_add_a_delay(): void
    {
        config([
            'app.api_slow_log_ms' => 500,
            'app.api_timing_headers' => true,
        ]);

        $request = Request::create('/api/health/live', 'GET');
        $startedAt = hrtime(true);

        $response = app(LogSlowApiRequests::class)->handle(
            $request,
            fn () => new Response('ok'),
        );

        $elapsedMs = (hrtime(true) - $startedAt) / 1_000_000;

        $this->assertLessThan(50, $elapsedMs);
        $this->assertLessThan(50, (int) $response->headers->get('X-Request-Time-Ms'));
    }
}
