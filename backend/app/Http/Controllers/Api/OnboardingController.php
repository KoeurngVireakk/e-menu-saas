<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOnboardingRequest;
use App\Http\Resources\OnboardingStatusResource;
use App\Services\RestaurantOnboardingService;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function __construct(private readonly RestaurantOnboardingService $onboarding) {}

    public function show(Request $request)
    {
        $validated = $request->validate(['shop_id' => ['nullable', 'integer', 'exists:shops,id']]);

        return $this->success('Onboarding status loaded', new OnboardingStatusResource(
            $this->onboarding->status($request->user(), isset($validated['shop_id']) ? (int) $validated['shop_id'] : null)
        ));
    }

    public function update(UpdateOnboardingRequest $request)
    {
        return $this->success('Onboarding progress updated', new OnboardingStatusResource(
            $this->onboarding->update($request->user(), $request->validated())
        ));
    }

    public function dismiss(Request $request)
    {
        $validated = $request->validate(['shop_id' => ['nullable', 'integer', 'exists:shops,id']]);

        return $this->success('Onboarding dismissed', new OnboardingStatusResource(
            $this->onboarding->dismiss($request->user(), isset($validated['shop_id']) ? (int) $validated['shop_id'] : null)
        ));
    }

    public function resume(Request $request)
    {
        $validated = $request->validate(['shop_id' => ['nullable', 'integer', 'exists:shops,id']]);

        return $this->success('Onboarding resumed', new OnboardingStatusResource(
            $this->onboarding->resume($request->user(), isset($validated['shop_id']) ? (int) $validated['shop_id'] : null)
        ));
    }
}
