<?php

namespace Database\Seeders;

use App\Services\PlanEntitlementService;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(PlanEntitlementService $entitlements): void
    {
        $entitlements->syncConfiguredPlans();
    }
}
