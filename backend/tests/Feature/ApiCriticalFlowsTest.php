<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiCriticalFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_health_register_login_and_authenticated_me_work(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'ok');

        $this->postJson('/api/auth/register', [
            'name' => 'New Owner',
            'email' => 'new-owner@example.test',
            'phone' => '+85510000001',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $user = User::factory()->create([
            'email' => 'owner@example.test',
            'password' => Hash::make('password'),
            'role' => 'shop_owner',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'owner@example.test',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'login',
            'entity_type' => 'user',
            'entity_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.email', 'owner@example.test');
    }

    public function test_owner_can_create_catalog_with_product_options_and_audit_logs(): void
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        Sanctum::actingAs($owner);

        $shopId = $this->postJson('/api/shops', [
            'name' => 'QA Cafe',
            'phone' => '+85510000002',
            'email' => 'qa@example.test',
            'address' => 'Phnom Penh',
            'description' => 'Test shop',
            'primary_color' => '#f97316',
            'secondary_color' => '#111827',
            'currency_code' => 'KHR',
            'status' => 'active',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->json('data.shop.id');

        $branchId = $this->postJson("/api/shops/{$shopId}/branches", [
            'name' => 'Main Branch',
            'phone' => '+85510000003',
            'address' => 'Phnom Penh',
            'opening_time' => '08:00',
            'closing_time' => '22:00',
            'status' => 'active',
        ])
            ->assertCreated()
            ->json('data.branch.id');

        $categoryId = $this->postJson("/api/shops/{$shopId}/categories", [
            'name' => 'Coffee',
            'sort_order' => 1,
            'status' => 'active',
        ])
            ->assertCreated()
            ->json('data.category.id');

        $productResponse = $this->postJson("/api/shops/{$shopId}/products", [
            'category_id' => $categoryId,
            'name' => 'Iced Latte',
            'description' => 'Espresso and milk',
            'price' => 10000,
            'is_featured' => true,
            'is_available' => true,
            'status' => 'active',
            'options' => [
                [
                    'name' => 'Size',
                    'type' => 'single',
                    'is_required' => true,
                    'values' => [
                        ['name' => 'Regular', 'extra_price' => 0],
                        ['name' => 'Large', 'extra_price' => 2000],
                    ],
                ],
                [
                    'name' => 'Add-ons',
                    'type' => 'multiple',
                    'is_required' => false,
                    'values' => [
                        ['name' => 'Extra shot', 'extra_price' => 2500],
                    ],
                ],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.product.name', 'Iced Latte')
            ->assertJsonCount(2, 'data.product.options');

        $this->getJson('/api/public/shops/qa-cafe/menu?branch='.$branchId)
            ->assertOk()
            ->assertJsonPath('data.shop.name', 'QA Cafe')
            ->assertJsonPath('data.categories.0.products.0.name', 'Iced Latte');

        $this->assertDatabaseHas('audit_logs', ['action' => 'shop.created', 'shop_id' => $shopId]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'product.created',
            'shop_id' => $shopId,
            'entity_id' => $productResponse->json('data.product.id'),
        ]);
    }

    public function test_public_order_option_pricing_order_status_and_payment_audits(): void
    {
        Storage::fake('public');
        $catalog = $this->createCatalog();

        $order = $this->submitOrder($catalog)
            ->assertCreated()
            ->assertJsonPath('data.order.grand_total', '14500.00')
            ->json('data.order');

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order['id'],
            'total_price' => 14500,
        ]);

        Sanctum::actingAs($catalog['owner']);

        $this->putJson("/api/orders/{$order['id']}/status", ['order_status' => 'accepted'])
            ->assertOk()
            ->assertJsonPath('data.order.order_status', 'accepted');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'order.status_changed',
            'entity_type' => 'order',
            'entity_id' => $order['id'],
        ]);

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'aba_manual',
            'transaction_reference' => 'TXN-1001',
            'proof_image' => $this->fakeProofImage(),
        ])
            ->assertCreated()
            ->assertJsonPath('data.payment.status', 'pending');

        $payment = Payment::where('order_id', $order['id'])->firstOrFail();
        Storage::disk('public')->assertExists($payment->proof_image_path);

        $this->putJson("/api/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('data.payment.status', 'paid');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payment.confirmed',
            'entity_type' => 'payment',
            'entity_id' => $payment->id,
        ]);

        $secondOrder = $this->submitOrder($catalog)->json('data.order');
        $this->postJson("/api/public/orders/{$secondOrder['order_number']}/payment", [
            'payment_method' => 'cash',
        ])->assertCreated();

        $failedPayment = Payment::where('order_id', $secondOrder['id'])->firstOrFail();

        $this->putJson("/api/payments/{$failedPayment->id}/reject", [
            'reason' => 'Reference does not match',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment.status', 'failed');

        $this->assertDatabaseHas('payment_logs', [
            'payment_id' => $failedPayment->id,
            'action' => 'rejected',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payment.rejected',
            'entity_type' => 'payment',
            'entity_id' => $failedPayment->id,
        ]);
    }

    public function test_system_health_requires_owner_or_super_admin(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $manager = User::factory()->create(['role' => 'manager']);

        Sanctum::actingAs($owner);
        $this->getJson('/api/system/health')
            ->assertOk()
            ->assertJsonPath('data.health.database.status', 'ok')
            ->assertJsonPath('data.health.storage.status', 'ok');

        Sanctum::actingAs($manager);
        $this->getJson('/api/system/health')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_staff_access_is_scoped_to_owned_or_assigned_shops_and_branches(): void
    {
        $catalog = $this->createCatalog();
        $otherCatalog = $this->createCatalog('Other Cafe');
        $manager = User::factory()->create(['role' => 'manager']);
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);
        $unrelatedOwner = User::factory()->create(['role' => 'shop_owner']);

        $catalog['shop']->staffAssignments()->create([
            'branch_id' => null,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $cashier->id,
            'role' => 'cashier',
            'status' => 'active',
        ]);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $waiter->id,
            'role' => 'waiter',
            'status' => 'active',
        ]);

        Sanctum::actingAs($catalog['owner']);
        $this->getJson("/api/shops/{$catalog['shop']->id}")->assertOk();

        Sanctum::actingAs($manager);
        $this->getJson("/api/shops/{$catalog['shop']->id}")->assertOk();

        Sanctum::actingAs($cashier);
        $this->getJson("/api/branches/{$catalog['branch']->id}")->assertOk();
        $this->getJson("/api/branches/{$otherCatalog['branch']->id}")->assertForbidden();

        Sanctum::actingAs($waiter);
        $this->getJson("/api/branches/{$catalog['branch']->id}")->assertOk();

        Sanctum::actingAs($unrelatedOwner);
        $this->getJson("/api/shops/{$catalog['shop']->id}")->assertForbidden();
    }

    public function test_staff_write_permissions_are_role_limited(): void
    {
        $catalog = $this->createCatalog();
        $manager = User::factory()->create(['role' => 'manager']);
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);

        $catalog['shop']->staffAssignments()->create([
            'branch_id' => null,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $cashier->id,
            'role' => 'cashier',
            'status' => 'active',
        ]);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $waiter->id,
            'role' => 'waiter',
            'status' => 'active',
        ]);

        Sanctum::actingAs($cashier);
        $this->deleteJson("/api/products/{$catalog['product']->id}")
            ->assertForbidden();

        Sanctum::actingAs($manager);
        $this->putJson("/api/products/{$catalog['product']->id}", [
            'category_id' => $catalog['category']->id,
            'name' => 'Manager Latte',
            'price' => 11000,
            'is_featured' => true,
            'is_available' => true,
            'status' => 'active',
        ])
            ->assertOk()
            ->assertJsonPath('data.product.name', 'Manager Latte');

        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');
        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'cash',
        ])->assertCreated();
        $payment = Payment::where('order_id', $order['id'])->firstOrFail();

        Sanctum::actingAs($waiter);
        $this->putJson("/api/payments/{$payment->id}/confirm")
            ->assertForbidden();
    }

    private function createCatalog(string $shopName = 'Test Cafe'): array
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => $shopName,
            'slug' => Str::slug($shopName).'-'.Str::lower(Str::random(6)),
            'currency_code' => 'KHR',
            'status' => 'active',
        ]);
        $branch = Branch::create([
            'shop_id' => $shop->id,
            'name' => 'Main Branch',
            'status' => 'active',
        ]);
        $category = Category::create([
            'shop_id' => $shop->id,
            'name' => 'Coffee',
            'slug' => 'coffee-'.Str::lower(Str::random(6)),
            'sort_order' => 1,
            'status' => 'active',
        ]);
        $product = Product::create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'name' => 'Iced Latte',
            'slug' => 'iced-latte-'.Str::lower(Str::random(6)),
            'price' => 10000,
            'is_featured' => true,
            'is_available' => true,
            'status' => 'active',
        ]);
        $size = $product->options()->create([
            'name' => 'Size',
            'type' => 'single',
            'is_required' => true,
        ]);
        $large = $size->values()->create(['name' => 'Large', 'extra_price' => 2000]);
        $addons = $product->options()->create([
            'name' => 'Add-ons',
            'type' => 'multiple',
            'is_required' => false,
        ]);
        $shot = $addons->values()->create(['name' => 'Extra shot', 'extra_price' => 2500]);

        return compact('owner', 'shop', 'branch', 'category', 'product', 'size', 'large', 'addons', 'shot');
    }

    private function submitOrder(array $catalog)
    {
        return $this->postJson('/api/public/orders', [
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
            'customer_name' => 'QA Customer',
            'customer_phone' => '+85510000004',
            'order_type' => 'dine_in',
            'items' => [
                [
                    'product_id' => $catalog['product']->id,
                    'quantity' => 1,
                    'selected_options' => [
                        [
                            'product_option_id' => $catalog['size']->id,
                            'product_option_value_id' => $catalog['large']->id,
                        ],
                        [
                            'product_option_id' => $catalog['addons']->id,
                            'product_option_value_ids' => [$catalog['shot']->id],
                        ],
                    ],
                ],
            ],
        ]);
    }

    private function fakeProofImage(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            'proof.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
        );
    }
}
