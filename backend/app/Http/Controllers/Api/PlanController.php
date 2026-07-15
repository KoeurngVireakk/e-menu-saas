<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Services\PlanEntitlementService;

class PlanController extends Controller
{
    public function __construct(private readonly PlanEntitlementService $entitlements) {}

    public function index()
    {
        return $this->success('Plans loaded', [
            'plans' => PlanResource::collection($this->entitlements->activePlans()),
        ]);
    }
}
