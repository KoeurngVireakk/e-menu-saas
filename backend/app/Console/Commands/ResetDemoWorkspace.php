<?php

namespace App\Console\Commands;

use Database\Seeders\DemoWorkspaceSeeder;
use Illuminate\Console\Command;

class ResetDemoWorkspace extends Command
{
    protected $signature = 'menudigi:demo-reset {--force : Reset even when scheduled resets are disabled}';

    protected $description = 'Rebuild only the isolated MenuDIGI demo tenant';

    public function handle(DemoWorkspaceSeeder $seeder): int
    {
        if (! config('demo.reset_enabled') && ! $this->option('force')) {
            $this->warn('Demo reset is disabled. Use --force for an intentional manual reset.');

            return self::FAILURE;
        }

        $seeder->run();
        $this->info('Demo workspace reset successfully.');

        return self::SUCCESS;
    }
}
