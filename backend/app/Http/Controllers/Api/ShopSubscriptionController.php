<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignShopPlanRequest;
use App\Http\Resources\SubscriptionSummaryResource;
use App\Models\Plan;
use App\Models\Shop;
use App\Services\PlanEntitlementService;
use Illuminate\Http\Request;

class ShopSubscriptionController extends Controller
{
    public function __construct(private readonly PlanEntitlementService $entitlements) {}

    public function show(Request $request, Shop $shop)
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canViewTenantSettings(), 403);

        return $this->success('Subscription loaded', new SubscriptionSummaryResource(
            $this->entitlements->summary($shop)
        ));
    }

    public function update(AssignShopPlanRequest $request, Shop $shop)
    {
        $validated = $request->validated();
        $plan = Plan::whereKey($validated['plan_id'])->where('is_active', true)->firstOrFail();
        $this->entitlements->assign($shop, $plan, $request->user(), $validated);

        $this->audit($request, 'subscription.assigned', $shop->id, 'shop_subscription', $shop->subscription()->value('id'), [
            'plan' => $plan->slug,
            'status' => $validated['status'],
        ]);

        return $this->success('Subscription assigned', new SubscriptionSummaryResource(
            $this->entitlements->summary($shop)
        ));
    }
}
