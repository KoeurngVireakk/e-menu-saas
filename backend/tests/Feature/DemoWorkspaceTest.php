<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Database\Seeders\DemoWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DemoWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_workspace_metadata_and_session_are_public_and_safe(): void
    {
        $this->seed(DemoWorkspaceSeeder::class);

        $this->getJson('/api/demo/workspace')
            ->assertOk()
            ->assertJsonPath('data.is_demo', true)
            ->assertJsonPath('data.mode', 'read_only')
            ->assertJsonPath('data.checkout_mode', 'simulated')
            ->assertJsonPath('data.table_code', 'T01');

        $this->postJson('/api/demo/session')
            ->assertOk()
            ->assertJsonPath('data.user.email', 'demo.owner@menudigi.test')
            ->assertJsonPath('data.user.shops.0.is_demo', true)
            ->assertJsonStructure(['data' => ['token', 'demo' => ['customer_path', 'admin_path']]]);
    }

    public function test_demo_menu_omits_contact_data_and_checkout_does_not_write(): void
    {
        $this->seed(DemoWorkspaceSeeder::class);
        $shop = Shop::where('is_demo', true)->firstOrFail();
        $branch = $shop->branches()->firstOrFail();
        $product = Product::where('shop_id', $shop->id)->where('slug', 'jasmine-cold-brew-tea')->firstOrFail();
        $orderCount = Order::count();

        $this->getJson("/api/public/shops/{$shop->slug}/menu?branch={$branch->id}&table=T01")
            ->assertOk()
            ->assertJsonPath('data.shop.is_demo', true)
            ->assertJsonPath('data.shop.phone', null)
            ->assertJsonPath('data.shop.email', null)
            ->assertJsonPath('data.shop.demo.checkout_mode', 'simulated');

        $this->postJson('/api/public/orders', [
            'shop_id' => $shop->id,
            'branch_id' => $branch->id,
            'table_code' => 'T01',
            'customer_name' => 'Not stored',
            'customer_phone' => '+855000000000',
            'order_type' => 'dine_in',
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 2,
            ]],
        ])->assertCreated()
            ->assertJsonPath('data.simulated', true)
            ->assertJsonPath('data.order.order_number', 'DEMO-PREVIEW')
            ->assertJsonPath('data.order.is_demo', true)
            ->assertJsonMissingPath('data.order.customer_name')
            ->assertJsonMissingPath('data.order.customer_phone');

        $this->assertSame($orderCount, Order::count());
    }

    public function test_demo_admin_mutations_and_demo_payments_are_blocked_at_the_api_boundary(): void
    {
        $this->seed(DemoWorkspaceSeeder::class);
        $shop = Shop::where('is_demo', true)->with('owner')->firstOrFail();
        Sanctum::actingAs($shop->owner);

        $this->postJson("/api/shops/{$shop->id}/categories", [
            'name' => 'Must not persist',
            'slug' => 'must-not-persist',
        ])->assertStatus(409)
            ->assertJsonPath('code', 'DEMO_WRITE_BLOCKED')
            ->assertJsonPath('demo_mode', true);

        $this->assertDatabaseMissing('categories', ['shop_id' => $shop->id, 'slug' => 'must-not-persist']);

        $this->postJson('/api/public/orders/DEMO-1002/payment', [
            'payment_method' => 'cash',
        ])->assertStatus(409)
            ->assertJsonPath('code', 'DEMO_PAYMENT_DISABLED');
    }

    public function test_demo_reset_is_deterministic_and_preserves_normal_tenants(): void
    {
        $normalOwner = User::factory()->create(['role' => 'shop_owner']);
        $normalShop = Shop::create([
            'owner_id' => $normalOwner->id,
            'name' => 'Real Tenant',
            'slug' => 'real-tenant',
            'status' => 'active',
            'is_demo' => false,
        ]);

        $this->seed(DemoWorkspaceSeeder::class);
        $firstDemoId = Shop::where('is_demo', true)->value('id');

        $this->artisan('menudigi:demo-reset', ['--force' => true])->assertSuccessful();

        $this->assertDatabaseHas('shops', ['id' => $normalShop->id, 'is_demo' => false]);
        $this->assertDatabaseCount('shops', 2);
        $this->assertSame(1, Shop::where('is_demo', true)->count());
        $this->assertNotSame($firstDemoId, Shop::where('is_demo', true)->value('id'));
        $this->assertSame(5, Order::whereHas('shop', fn ($query) => $query->where('is_demo', true))->count());
    }

    public function test_normal_tenant_writes_remain_unchanged(): void
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Normal Cafe',
            'slug' => 'normal-cafe',
            'status' => 'active',
        ]);
        Sanctum::actingAs($owner);

        $this->postJson("/api/shops/{$shop->id}/categories", [
            'name' => 'Lunch',
            'slug' => 'lunch',
            'status' => 'active',
        ])->assertCreated();

        $this->assertDatabaseHas('categories', ['shop_id' => $shop->id, 'slug' => 'lunch']);
    }

    public function test_mixed_tenant_user_cannot_mutate_demo_but_can_mutate_normal_shop(): void
    {
        $this->seed(DemoWorkspaceSeeder::class);
        $demo = Shop::where('is_demo', true)->firstOrFail();
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $normal = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Mixed Account Cafe',
            'slug' => 'mixed-account-cafe',
            'status' => 'active',
        ]);
        $demo->staffAssignments()->create([
            'branch_id' => null,
            'user_id' => $owner->id,
            'role' => 'manager',
            'status' => 'active',
        ]);
        Sanctum::actingAs($owner);

        $this->postJson("/api/shops/{$demo->id}/categories", [
            'name' => 'Blocked',
            'slug' => 'blocked',
        ])->assertStatus(409)->assertJsonPath('code', 'DEMO_WRITE_BLOCKED');

        $this->postJson("/api/shops/{$normal->id}/categories", [
            'name' => 'Allowed',
            'slug' => 'allowed',
            'status' => 'active',
        ])->assertCreated();
    }
}
