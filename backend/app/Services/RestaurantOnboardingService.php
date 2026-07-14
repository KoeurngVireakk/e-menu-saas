<?php

namespace App\Services;

use App\Models\RestaurantOnboardingState;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RestaurantOnboardingService
{
    public const STEPS = [
        'shop_profile',
        'branch',
        'category',
        'product',
        'table',
        'table_qr',
        'payment_instructions',
        'public_menu_preview',
        'workspace_ready',
    ];

    private const MANUAL_STEPS = ['public_menu_preview', 'workspace_ready'];

    public function status(User $user, ?int $shopId = null): array
    {
        $shop = $this->resolveOwnedShop($user, $shopId);
        $state = $this->state($user, $shop);

        return $this->synchronize($state, $shop);
    }

    public function update(User $user, array $data): array
    {
        $shop = $this->resolveOwnedShop($user, isset($data['shop_id']) ? (int) $data['shop_id'] : null);
        $state = $this->state($user, $shop);

        if (isset($data['current_step'])) {
            $state->current_step = $data['current_step'];
        }

        if (isset($data['step'])) {
            $step = $data['step'];

            if (! in_array($step, self::MANUAL_STEPS, true)) {
                throw ValidationException::withMessages([
                    'step' => ['This onboarding step is verified automatically from restaurant data.'],
                ]);
            }

            $manualSteps = collect($state->completed_steps_json ?? []);
            $completing = (bool) ($data['completed'] ?? true);

            if ($step === 'workspace_ready' && $completing) {
                $current = $this->completionMap($shop, $state);
                $prerequisites = collect(self::STEPS)->reject(fn (string $key): bool => $key === 'workspace_ready');

                if ($prerequisites->contains(fn (string $key): bool => ! $current[$key])) {
                    throw ValidationException::withMessages([
                        'step' => ['Complete the restaurant setup and preview the public menu before marking the workspace ready.'],
                    ]);
                }
            }

            $state->completed_steps_json = $completing
                ? $manualSteps->push($step)->unique()->values()->all()
                : $manualSteps->reject(fn (string $key): bool => $key === $step)->values()->all();
        }

        $state->save();

        return $this->synchronize($state->fresh(), $shop);
    }

    public function dismiss(User $user, ?int $shopId = null): array
    {
        $shop = $this->resolveOwnedShop($user, $shopId);
        $state = $this->state($user, $shop);
        $state->update(['is_dismissed' => true]);

        return $this->synchronize($state->fresh(), $shop);
    }

    public function resume(User $user, ?int $shopId = null): array
    {
        $shop = $this->resolveOwnedShop($user, $shopId);
        $state = $this->state($user, $shop);
        $state->update([
            'is_dismissed' => false,
            'last_resumed_at' => now(),
        ]);

        return $this->synchronize($state->fresh(), $shop);
    }

    private function resolveOwnedShop(User $user, ?int $shopId): ?Shop
    {
        abort_unless($user->role === 'shop_owner' || $user->role === 'super_admin', 403);

        if ($shopId) {
            $shop = Shop::findOrFail($shopId);
            abort_unless($user->role === 'super_admin' || $shop->owner_id === $user->id, 403);

            return $shop;
        }

        return $user->shops()->orderBy('id')->first();
    }

    private function state(User $user, ?Shop $shop): RestaurantOnboardingState
    {
        return DB::transaction(function () use ($user, $shop): RestaurantOnboardingState {
            if ($shop) {
                $existing = RestaurantOnboardingState::where('user_id', $user->id)->where('shop_id', $shop->id)->first();

                if ($existing) {
                    return $existing;
                }

                $unscoped = RestaurantOnboardingState::where('user_id', $user->id)->whereNull('shop_id')->first();

                if ($unscoped) {
                    $unscoped->update(['shop_id' => $shop->id]);

                    return $unscoped->fresh();
                }
            }

            return RestaurantOnboardingState::firstOrCreate([
                'user_id' => $user->id,
                'shop_id' => $shop?->id,
            ], [
                'current_step' => 'shop_profile',
                'completed_steps_json' => [],
            ]);
        });
    }

    private function synchronize(RestaurantOnboardingState $state, ?Shop $shop): array
    {
        $completion = $this->completionMap($shop, $state);
        $completedSteps = collect(self::STEPS)->filter(fn (string $key): bool => $completion[$key])->values();
        $nextStep = collect(self::STEPS)->first(fn (string $key): bool => ! $completion[$key]);
        $currentStep = in_array($state->current_step, self::STEPS, true) && ! $completion[$state->current_step]
            ? $state->current_step
            : ($nextStep ?? 'workspace_ready');
        $isComplete = $nextStep === null;
        $completedAt = $isComplete ? ($state->completed_at ?? now()) : null;
        $completedAtChanged = ($state->completed_at === null) !== ($completedAt === null)
            || ($state->completed_at !== null && $completedAt !== null && ! $state->completed_at->equalTo($completedAt));

        if ($state->current_step !== $currentStep || $completedAtChanged) {
            $state->forceFill([
                'current_step' => $currentStep,
                'completed_at' => $completedAt,
            ])->save();
        }

        return [
            'shop' => $shop ? [
                'id' => $shop->id,
                'name' => $shop->name,
                'slug' => $shop->slug,
                'is_demo' => $shop->is_demo,
            ] : null,
            'current_step' => $currentStep,
            'next_step' => $nextStep,
            'completed_steps' => $completedSteps->all(),
            'completed_count' => $completedSteps->count(),
            'total_steps' => count(self::STEPS),
            'progress_percent' => (int) round(($completedSteps->count() / count(self::STEPS)) * 100),
            'is_complete' => $isComplete,
            'is_dismissed' => $state->is_dismissed,
            'completed_at' => $completedAt,
            'last_resumed_at' => $state->last_resumed_at,
            'steps' => collect(self::STEPS)->map(fn (string $key): array => [
                'key' => $key,
                'complete' => $completion[$key],
                'verification' => in_array($key, self::MANUAL_STEPS, true) ? 'user_confirmed' : 'restaurant_data',
                'action_path' => $this->actionPath($key, $shop),
            ])->all(),
            'preview_path' => $this->previewPath($shop),
            'qr_action_path' => $shop ? '/admin/tables' : null,
        ];
    }

    private function completionMap(?Shop $shop, RestaurantOnboardingState $state): array
    {
        $manual = collect($state->completed_steps_json ?? []);

        if (! $shop) {
            return array_fill_keys(self::STEPS, false);
        }

        $shop->loadCount(['branches', 'categories', 'products', 'diningTables']);
        $shopProfile = filled($shop->name) && filled($shop->slug) && filled($shop->address) && filled($shop->currency_code);
        $branch = $shop->branches_count > 0;
        $category = $shop->categories_count > 0;
        $product = $shop->products_count > 0;
        $table = $shop->dining_tables_count > 0;
        $tableQr = $table && $shop->diningTables()->whereNotNull('qr_token')->whereNotNull('qr_url')->exists();
        $paymentInstructions = $shop->settings()->where('key', 'payment_instructions')->whereNotNull('value')->where('value', '!=', '')->exists();
        $publicPreview = $manual->contains('public_menu_preview');
        $ready = $manual->contains('workspace_ready')
            && $shopProfile && $branch && $category && $product && $table && $tableQr && $paymentInstructions && $publicPreview;

        return [
            'shop_profile' => $shopProfile,
            'branch' => $branch,
            'category' => $category,
            'product' => $product,
            'table' => $table,
            'table_qr' => $tableQr,
            'payment_instructions' => $paymentInstructions,
            'public_menu_preview' => $publicPreview,
            'workspace_ready' => $ready,
        ];
    }

    private function actionPath(string $step, ?Shop $shop): string
    {
        return match ($step) {
            'shop_profile' => '/admin/shops',
            'branch' => '/admin/branches',
            'category' => '/admin/categories',
            'product' => '/admin/products',
            'table', 'table_qr' => '/admin/tables',
            'payment_instructions' => '/admin/settings?section=payments',
            'public_menu_preview' => $this->previewPath($shop) ?? '/admin/products',
            'workspace_ready' => '/admin/onboarding',
        };
    }

    private function previewPath(?Shop $shop): ?string
    {
        if (! $shop) {
            return null;
        }

        $branch = $shop->branches()->where('status', 'active')->orderBy('id')->first();
        $table = $branch?->diningTables()->where('status', 'active')->orderBy('id')->first();

        if (! $branch) {
            return null;
        }

        $query = http_build_query(array_filter([
            'branch' => $branch->id,
            'table' => $table?->table_code,
        ]));

        return "/menu/{$shop->slug}".($query ? "?{$query}" : '');
    }
}
