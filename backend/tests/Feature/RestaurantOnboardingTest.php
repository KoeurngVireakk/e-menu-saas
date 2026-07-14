<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\RestaurantOnboardingState;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RestaurantOnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_owner_receives_persistent_incomplete_onboarding(): void
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        Sanctum::actingAs($owner);

        $this->getJson('/api/onboarding')
            ->assertOk()
            ->assertJsonPath('data.shop', null)
            ->assertJsonPath('data.current_step', 'shop_profile')
            ->assertJsonPath('data.completed_count', 0)
            ->assertJsonPath('data.total_steps', 9)
            ->assertJsonPath('data.progress_percent', 0)
            ->assertJsonCount(9, 'data.steps');

        $this->assertDatabaseHas('restaurant_onboarding_states', [
            'user_id' => $owner->id,
            'shop_id' => null,
            'current_step' => 'shop_profile',
        ]);
    }

    public function test_configured_owner_receives_data_derived_progress_and_can_finish(): void
    {
        $catalog = $this->configuredCatalog();
        Sanctum::actingAs($catalog['owner']);

        $this->getJson("/api/onboarding?shop_id={$catalog['shop']->id}")
            ->assertOk()
            ->assertJsonPath('data.completed_count', 7)
            ->assertJsonPath('data.steps.5.key', 'table_qr')
            ->assertJsonPath('data.steps.5.complete', true)
            ->assertJsonPath('data.steps.6.key', 'payment_instructions')
            ->assertJsonPath('data.steps.6.complete', true)
            ->assertJsonPath('data.steps.7.complete', false);

        $this->patchJson('/api/onboarding', [
            'shop_id' => $catalog['shop']->id,
            'step' => 'public_menu_preview',
            'completed' => true,
        ])->assertOk()
            ->assertJsonPath('data.completed_count', 8)
            ->assertJsonPath('data.preview_path', "/menu/{$catalog['shop']->slug}?branch={$catalog['branch']->id}&table=T01");

        $this->patchJson('/api/onboarding', [
            'shop_id' => $catalog['shop']->id,
            'step' => 'workspace_ready',
            'completed' => true,
        ])->assertOk()
            ->assertJsonPath('data.is_complete', true)
            ->assertJsonPath('data.progress_percent', 100)
            ->assertJsonPath('data.next_step', null);

        $this->assertNotNull(RestaurantOnboardingState::where('shop_id', $catalog['shop']->id)->value('completed_at'));
    }

    public function test_real_data_removal_invalidates_stale_completion(): void
    {
        $catalog = $this->configuredCatalog();
        Sanctum::actingAs($catalog['owner']);

        $this->patchJson('/api/onboarding', [
            'shop_id' => $catalog['shop']->id,
            'step' => 'public_menu_preview',
            'completed' => true,
        ])->assertOk();
        $this->patchJson('/api/onboarding', [
            'shop_id' => $catalog['shop']->id,
            'step' => 'workspace_ready',
            'completed' => true,
        ])->assertOk();

        $catalog['category']->delete();

        $this->getJson("/api/onboarding?shop_id={$catalog['shop']->id}")
            ->assertOk()
            ->assertJsonPath('data.is_complete', false)
            ->assertJsonPath('data.steps.2.complete', false)
            ->assertJsonPath('data.steps.3.complete', false)
            ->assertJsonPath('data.steps.8.complete', false)
            ->assertJsonPath('data.completed_at', null);
    }

    public function test_dismiss_and_resume_are_persistent(): void
    {
        $catalog = $this->configuredCatalog();
        Sanctum::actingAs($catalog['owner']);

        $this->postJson('/api/onboarding/dismiss', ['shop_id' => $catalog['shop']->id])
            ->assertOk()
            ->assertJsonPath('data.is_dismissed', true);

        $this->postJson('/api/onboarding/resume', ['shop_id' => $catalog['shop']->id])
            ->assertOk()
            ->assertJsonPath('data.is_dismissed', false)
            ->assertJsonPath('data.last_resumed_at', fn ($value) => filled($value));
    }

    public function test_owner_cannot_read_or_modify_another_shops_onboarding(): void
    {
        $first = $this->configuredCatalog('First Cafe');
        $second = $this->configuredCatalog('Second Cafe');
        Sanctum::actingAs($first['owner']);

        $this->getJson("/api/onboarding?shop_id={$second['shop']->id}")->assertForbidden();
        $this->patchJson('/api/onboarding', [
            'shop_id' => $second['shop']->id,
            'step' => 'public_menu_preview',
            'completed' => true,
        ])->assertForbidden();
        $this->postJson('/api/onboarding/dismiss', ['shop_id' => $second['shop']->id])->assertForbidden();
    }

    public function test_data_verified_steps_cannot_be_manually_faked_and_ready_requires_prerequisites(): void
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Incomplete Cafe',
            'slug' => 'incomplete-cafe',
            'currency_code' => 'KHR',
            'status' => 'active',
        ]);
        Sanctum::actingAs($owner);

        $this->patchJson('/api/onboarding', [
            'shop_id' => $shop->id,
            'step' => 'branch',
            'completed' => true,
        ])->assertUnprocessable()
            ->assertJsonPath('errors.step.0', 'This onboarding step is verified automatically from restaurant data.');

        $this->patchJson('/api/onboarding', [
            'shop_id' => $shop->id,
            'step' => 'workspace_ready',
            'completed' => true,
        ])->assertUnprocessable()
            ->assertJsonPath('errors.step.0', 'Complete the restaurant setup and preview the public menu before marking the workspace ready.');
    }

    private function configuredCatalog(string $name = 'Configured Cafe'): array
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $slug = str($name)->slug()->append('-'.str()->lower(str()->random(4)))->toString();
        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => $name,
            'slug' => $slug,
            'address' => 'Phnom Penh',
            'currency_code' => 'KHR',
            'status' => 'active',
        ]);
        $branch = $shop->branches()->create([
            'name' => 'Main Branch',
            'address' => 'Phnom Penh',
            'status' => 'active',
        ]);
        $category = Category::create([
            'shop_id' => $shop->id,
            'name' => 'Drinks',
            'slug' => 'drinks',
            'status' => 'active',
        ]);
        Product::create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'name' => 'Tea',
            'slug' => 'tea',
            'price' => 5000,
            'is_available' => true,
            'status' => 'active',
        ]);
        $branch->diningTables()->create([
            'shop_id' => $shop->id,
            'table_name' => 'Table 01',
            'table_code' => 'T01',
            'qr_token' => hash('sha256', "onboarding-{$shop->id}-T01"),
            'qr_url' => "http://localhost/menu/{$shop->slug}?branch={$branch->id}&table=T01",
            'status' => 'active',
        ]);
        $shop->settings()->create([
            'key' => 'payment_instructions',
            'value' => 'Pay cash at the counter or upload a transfer proof.',
        ]);

        return compact('owner', 'shop', 'branch', 'category');
    }
}
