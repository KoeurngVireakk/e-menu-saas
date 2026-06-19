<?php

namespace Tests\Feature;

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
}
