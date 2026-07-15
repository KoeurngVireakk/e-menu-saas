<?php

namespace App\Services;

use App\Exceptions\PlanGovernanceException;
use App\Models\Plan;
use App\Models\Shop;
use App\Models\ShopSubscription;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PlanEntitlementService
{
    public const RESOURCES = ['branches', 'staff_members', 'products', 'tables', 'print_stations'];

    public const FEATURES = ['data_export', 'advanced_reports', 'multi_branch_operations'];

    public const STATUSES = ['trialing', 'active', 'past_due', 'suspended', 'cancelled', 'expired'];

    public function syncConfiguredPlans(): Collection
    {
        return collect(config('plans.definitions', []))->map(function (array $definition, string $slug): Plan {
            $plan = Plan::firstOrNew(['slug' => $slug]);
            $plan->fill([
                'name' => $definition['name'],
                'description' => $definition['description'] ?? null,
                'limits_json' => $definition['limits'] ?? [],
                'features_json' => $definition['features'] ?? [],
                'is_active' => true,
                'sort_order' => $definition['sort_order'] ?? 0,
            ]);

            if ($plan->isDirty()) {
                $plan->save();
            }

            return $plan;
        })->values();
    }

    public function activePlans(): Collection
    {
        $this->syncConfiguredPlans();

        return Plan::where('is_active', true)->orderBy('sort_order')->get();
    }

    public function subscriptionFor(Shop $shop): ShopSubscription
    {
        $subscription = $shop->subscription()->with('plan')->first();

        if ($subscription) {
            return $subscription;
        }

        $plans = $this->syncConfiguredPlans();
        $plan = $plans->firstWhere('slug', config('plans.default_slug')) ?? $plans->first();
        abort_unless($plan, 503, 'Plan configuration is unavailable.');

        $now = now();

        return $shop->subscription()->create([
            'plan_id' => $plan->id,
            'status' => 'trialing',
            'trial_started_at' => $now,
            'trial_ends_at' => $now->copy()->addDays((int) config('plans.trial_days', 14)),
        ])->load('plan');
    }

    public function assign(Shop $shop, Plan $plan, User $actor, array $attributes): ShopSubscription
    {
        return DB::transaction(function () use ($shop, $plan, $actor, $attributes): ShopSubscription {
            $status = $attributes['status'];
            $trialDays = isset($attributes['trial_days']) ? (int) $attributes['trial_days'] : null;
            $trialStartedAt = $status === 'trialing' ? now() : null;
            $trialEndsAt = $status === 'trialing'
                ? now()->addDays($trialDays ?? (int) config('plans.trial_days', 14))
                : null;

            return ShopSubscription::updateOrCreate(['shop_id' => $shop->id], [
                'plan_id' => $plan->id,
                'status' => $status,
                'trial_started_at' => $trialStartedAt,
                'trial_ends_at' => $trialEndsAt,
                'starts_at' => $attributes['starts_at'] ?? ($status === 'active' ? now() : null),
                'ends_at' => $attributes['ends_at'] ?? null,
                'assigned_by' => $actor->id,
                'notes' => $attributes['notes'] ?? null,
            ])->load('plan');
        });
    }

    public function summary(Shop $shop): array
    {
        $subscription = $this->subscriptionFor($shop);
        $effectiveStatus = $this->effectiveStatus($subscription);
        $usage = collect(self::RESOURCES)->mapWithKeys(fn (string $resource): array => [
            $resource => $this->usageLine($shop, $subscription->plan, $resource),
        ]);

        return [
            'shop' => ['id' => $shop->id, 'name' => $shop->name],
            'plan' => $subscription->plan,
            'subscription' => $subscription,
            'effective_status' => $effectiveStatus,
            'write_access' => [
                'allowed' => in_array($effectiveStatus, ['trialing', 'active'], true),
                'reason' => in_array($effectiveStatus, ['trialing', 'active'], true) ? null : 'Subscription status blocks new resource creation. Existing data remains available.',
            ],
            'usage' => $usage->all(),
            'upgrade_contact' => [
                'method' => 'email',
                'email' => config('plans.upgrade_contact_email'),
            ],
        ];
    }

    public function assertCanCreate(Shop $shop, string $resource): void
    {
        abort_unless(in_array($resource, self::RESOURCES, true), 500, 'Unknown governed resource.');
        $subscription = $this->subscriptionFor($shop);
        $this->assertWriteStatus($subscription, $resource);
        $usage = $this->usageLine($shop, $subscription->plan, $resource);

        if ($usage['limit'] !== null && $usage['current'] >= $usage['limit']) {
            throw new PlanGovernanceException(
                "The {$subscription->plan->name} plan limit for {$this->label($resource)} has been reached.",
                'PLAN_LIMIT_REACHED',
                [
                    'resource' => $resource,
                    'current_usage' => $usage['current'],
                    'allowed_limit' => $usage['limit'],
                    'plan_name' => $subscription->plan->name,
                    'upgrade_required' => true,
                ],
            );
        }
    }

    public function assertFeature(Shop $shop, string $feature): void
    {
        abort_unless(in_array($feature, self::FEATURES, true), 500, 'Unknown plan feature.');
        $subscription = $this->subscriptionFor($shop);

        if (! (bool) data_get($subscription->plan->features_json, $feature, false)) {
            throw new PlanGovernanceException(
                "{$this->label($feature)} is not included in the {$subscription->plan->name} plan.",
                'PLAN_FEATURE_NOT_INCLUDED',
                [
                    'feature' => $feature,
                    'plan_name' => $subscription->plan->name,
                    'upgrade_required' => true,
                ],
            );
        }
    }

    public function assertFeatureForShops(array $shopIds, string $feature): void
    {
        Shop::whereIn('id', $shopIds)->get()->each(fn (Shop $shop) => $this->assertFeature($shop, $feature));
    }

    public function effectiveStatus(ShopSubscription $subscription): string
    {
        if ($subscription->status === 'trialing' && $subscription->trial_ends_at?->isPast()) {
            return 'expired';
        }

        if (in_array($subscription->status, ['trialing', 'active'], true) && $subscription->ends_at?->isPast()) {
            return 'expired';
        }

        return $subscription->status;
    }

    private function assertWriteStatus(ShopSubscription $subscription, string $resource): void
    {
        $status = $this->effectiveStatus($subscription);

        if (in_array($status, ['trialing', 'active'], true)) {
            return;
        }

        throw new PlanGovernanceException(
            'New resource creation is unavailable for this subscription status. Existing restaurant data remains readable.',
            'SUBSCRIPTION_WRITE_BLOCKED',
            [
                'resource' => $resource,
                'subscription_status' => $status,
                'plan_name' => $subscription->plan->name,
                'upgrade_required' => false,
            ],
            403,
        );
    }

    private function usageLine(Shop $shop, Plan $plan, string $resource): array
    {
        $current = match ($resource) {
            'branches' => $shop->branches()->count(),
            'staff_members' => $shop->staffAssignments()->where('status', 'active')->count(),
            'products' => $shop->products()->count(),
            'tables' => $shop->diningTables()->count(),
            'print_stations' => $shop->printStations()->count(),
        };
        $limit = data_get($plan->limits_json, $resource);
        $limit = $limit === null ? null : (int) $limit;

        return [
            'resource' => $resource,
            'current' => $current,
            'limit' => $limit,
            'remaining' => $limit === null ? null : max(0, $limit - $current),
            'unlimited' => $limit === null,
            'percent_used' => $limit === null || $limit === 0 ? null : min(100, (int) round(($current / $limit) * 100)),
        ];
    }

    private function label(string $key): string
    {
        return str($key)->replace('_', ' ')->toString();
    }
}
