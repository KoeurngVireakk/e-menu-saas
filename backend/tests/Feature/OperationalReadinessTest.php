<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class OperationalReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_live_returns_public_safe_payload(): void
    {
        $this->getJson('/api/health/live')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'ok')
            ->assertJsonStructure([
                'data' => [
                    'status',
                    'app',
                    'timestamp',
                    'version',
                    'commit',
                ],
            ])
            ->assertJsonMissingPath('data.database')
            ->assertJsonMissingPath('data.path');
    }

    public function test_health_ready_returns_safe_check_summary(): void
    {
        $sensitiveDatabasePassword = 'super-secret-db-password-for-test';
        config(['database.connections.mysql.password' => $sensitiveDatabasePassword]);

        $response = $this->getJson('/api/health/ready')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'ok')
            ->assertJsonPath('data.checks.database.status', 'ok')
            ->assertJsonPath('data.checks.cache.status', 'ok')
            ->assertJsonPath('data.checks.storage.status', 'ok');

        $this->assertStringNotContainsString(base_path(), $response->getContent());
        $this->assertStringNotContainsString($sensitiveDatabasePassword, $response->getContent());
        $this->assertStringNotContainsString('DB_PASSWORD', $response->getContent());
    }

    public function test_production_check_command_reports_without_printing_secrets(): void
    {
        config([
            'app.debug' => false,
            'app.key' => 'base64:test-key',
            'broadcasting.default' => 'null',
            'queue.default' => 'database',
        ]);

        $exitCode = Artisan::call('menudigi:production-check');
        $output = Artisan::output();

        $this->assertSame(0, $exitCode);
        $this->assertStringContainsString('Production check completed', $output);
        $this->assertStringContainsString('APP_KEY is configured', $output);
        $this->assertStringNotContainsString('base64:test-key', $output);
    }

    public function test_backup_check_command_reports_prerequisites_without_exporting_data(): void
    {
        $sensitiveDatabasePassword = 'super-secret-db-password-for-test';
        config(['database.connections.mysql.password' => $sensitiveDatabasePassword]);

        $exitCode = Artisan::call('menudigi:backup-check');
        $output = Artisan::output();

        $this->assertSame(0, $exitCode);
        $this->assertStringContainsString('Backup check completed', $output);
        $this->assertStringContainsString('Database connection works for backup source', $output);
        $this->assertStringNotContainsString($sensitiveDatabasePassword, $output);
        $this->assertStringNotContainsString('DB_PASSWORD', $output);
    }
}
