<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\QueryException;
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
            'payment_method' => 'khqr_manual',
            'transaction_reference' => 'TXN-1001',
            'proof_image' => $this->fakeProofImage(),
        ])
            ->assertCreated()
            ->assertJsonPath('data.payment.status', 'pending')
            ->assertJsonPath('data.payment.provider', 'manual')
            ->assertJsonPath('data.next_action', 'upload_proof');

        $payment = Payment::where('order_id', $order['id'])->firstOrFail();
        $this->assertTrue(Storage::disk('public')->exists((string) $payment->proof_image_path));

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
        ])
            ->assertCreated()
            ->assertJsonPath('data.next_action', 'none');

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

    public function test_shop_owner_can_manage_staff_and_settings_with_audit_logs(): void
    {
        $catalog = $this->createCatalog();
        $owner = $catalog['owner'];
        Sanctum::actingAs($owner);

        $staffResponse = $this->postJson("/api/shops/{$catalog['shop']->id}/staff", [
            'name' => 'QA Waiter',
            'email' => 'qa-waiter@example.test',
            'phone' => '+85510000005',
            'branch_id' => $catalog['branch']->id,
            'role' => 'waiter',
            'status' => 'active',
        ])
            ->assertCreated()
            ->assertJsonPath('data.staff.role', 'waiter')
            ->assertJsonStructure(['data' => ['staff', 'temporary_password']]);

        $staffId = $staffResponse->json('data.staff.id');
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'staff.added',
            'entity_type' => 'shop_staff',
            'entity_id' => $staffId,
        ]);

        $this->putJson("/api/shop-staff/{$staffId}", [
            'branch_id' => null,
            'role' => 'cashier',
            'status' => 'active',
        ])
            ->assertOk()
            ->assertJsonPath('data.staff.role', 'cashier')
            ->assertJsonPath('data.staff.branch_id', null);

        $this->putJson("/api/shop-staff/{$staffId}/status", ['status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.staff.status', 'inactive');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'staff.disabled',
            'entity_type' => 'shop_staff',
            'entity_id' => $staffId,
        ]);

        $this->postJson("/api/shops/{$catalog['shop']->id}/settings", [
            'name' => 'Updated Cafe',
            'phone' => '+85510000006',
            'email' => 'updated@example.test',
            'address' => 'Updated address',
            'description' => 'Updated description',
            'primary_color' => '#111827',
            'secondary_color' => '#f97316',
            'currency_code' => 'USD',
            'order_auto_accept' => true,
            'service_charge_percentage' => 5,
            'tax_percentage' => 10,
        ])
            ->assertOk()
            ->assertJsonPath('data.shop.name', 'Updated Cafe')
            ->assertJsonPath('data.settings.order_auto_accept', true)
            ->assertJsonPath('data.settings.service_charge_percentage', 5);

        $this->assertDatabaseHas('shop_settings', [
            'shop_id' => $catalog['shop']->id,
            'key' => 'tax_percentage',
            'value' => '10',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'shop.settings_updated',
            'entity_type' => 'shop',
            'entity_id' => $catalog['shop']->id,
        ]);
    }

    public function test_staff_management_permissions_are_enforced(): void
    {
        $catalog = $this->createCatalog();
        $manager = User::factory()->create(['role' => 'manager']);
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);

        $managerStaff = $catalog['shop']->staffAssignments()->create([
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

        Sanctum::actingAs($manager);
        $this->getJson("/api/shops/{$catalog['shop']->id}/staff")
            ->assertOk()
            ->assertJsonPath('success', true);
        $this->deleteJson("/api/shop-staff/{$managerStaff->id}")
            ->assertForbidden();

        Sanctum::actingAs($cashier);
        $this->postJson("/api/shops/{$catalog['shop']->id}/staff", [
            'name' => 'Blocked',
            'email' => 'blocked@example.test',
            'role' => 'waiter',
        ])->assertForbidden();

        Sanctum::actingAs($waiter);
        $this->putJson("/api/shop-staff/{$managerStaff->id}", [
            'branch_id' => null,
            'role' => 'cashier',
            'status' => 'active',
        ])->assertForbidden();

        Sanctum::actingAs($catalog['owner']);
        $this->postJson("/api/shops/{$catalog['shop']->id}/staff", [
            'name' => 'Blocked Admin',
            'email' => 'blocked-admin@example.test',
            'role' => 'super_admin',
        ])->assertUnprocessable();
    }

    public function test_public_menu_returns_khmer_translations_when_locale_is_km(): void
    {
        $catalog = $this->createCatalog();

        $catalog['shop']->translations()->create([
            'locale' => 'km',
            'name' => 'ហាងកាហ្វេសាកល្បង',
            'description' => 'ម៉ឺនុយភាសាខ្មែរ',
            'address' => 'ភ្នំពេញ',
        ]);
        $catalog['category']->translations()->create([
            'locale' => 'km',
            'name' => 'កាហ្វេ',
        ]);
        $catalog['product']->translations()->create([
            'locale' => 'km',
            'name' => 'ឡាតេទឹកកក',
            'description' => 'កាហ្វេជាមួយទឹកដោះគោ',
        ]);
        $catalog['size']->translations()->create([
            'locale' => 'km',
            'name' => 'ទំហំ',
        ]);
        $catalog['large']->translations()->create([
            'locale' => 'km',
            'name' => 'ធំ',
        ]);

        $this->getJson("/api/public/shops/{$catalog['shop']->slug}/menu?branch={$catalog['branch']->id}&locale=km")
            ->assertOk()
            ->assertJsonPath('data.current_locale', 'km')
            ->assertJsonPath('data.supported_locales.0', 'en')
            ->assertJsonPath('data.supported_locales.1', 'km')
            ->assertJsonPath('data.shop.name', 'ហាងកាហ្វេសាកល្បង')
            ->assertJsonPath('data.shop.description', 'ម៉ឺនុយភាសាខ្មែរ')
            ->assertJsonPath('data.categories.0.name', 'កាហ្វេ')
            ->assertJsonPath('data.categories.0.products.0.name', 'ឡាតេទឹកកក')
            ->assertJsonPath('data.categories.0.products.0.description', 'កាហ្វេជាមួយទឹកដោះគោ')
            ->assertJsonPath('data.categories.0.products.0.options.0.name', 'ទំហំ')
            ->assertJsonPath('data.categories.0.products.0.options.0.values.0.name', 'ធំ');
    }

    public function test_public_menu_falls_back_to_base_text_when_translation_is_missing(): void
    {
        $catalog = $this->createCatalog();

        $this->getJson("/api/public/shops/{$catalog['shop']->slug}/menu?branch={$catalog['branch']->id}&locale=km")
            ->assertOk()
            ->assertJsonPath('data.current_locale', 'km')
            ->assertJsonPath('data.shop.name', $catalog['shop']->name)
            ->assertJsonPath('data.categories.0.name', $catalog['category']->name)
            ->assertJsonPath('data.categories.0.products.0.name', $catalog['product']->name)
            ->assertJsonPath('data.categories.0.products.0.options.0.name', $catalog['size']->name)
            ->assertJsonPath('data.categories.0.products.0.options.0.values.0.name', $catalog['large']->name);
    }

    public function test_manager_can_update_assigned_category_and_product_translations(): void
    {
        $catalog = $this->createCatalog();
        $manager = User::factory()->create(['role' => 'manager']);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => null,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);

        Sanctum::actingAs($manager);

        $this->putJson("/api/categories/{$catalog['category']->id}/translations", [
            'translations' => [
                'en' => ['name' => 'Coffee'],
                'km' => ['name' => 'កាហ្វេ'],
            ],
        ])
            ->assertOk()
            ->assertJsonFragment(['locale' => 'km', 'name' => 'កាហ្វេ']);

        $this->putJson("/api/products/{$catalog['product']->id}/translations", [
            'translations' => [
                'en' => ['name' => 'Iced Latte', 'description' => 'Cold latte'],
                'km' => ['name' => 'ឡាតេទឹកកក', 'description' => 'កាហ្វេត្រជាក់'],
            ],
        ])
            ->assertOk()
            ->assertJsonFragment(['locale' => 'km', 'name' => 'ឡាតេទឹកកក']);

        $this->assertDatabaseHas('category_translations', [
            'category_id' => $catalog['category']->id,
            'locale' => 'km',
            'name' => 'កាហ្វេ',
        ]);
        $this->assertDatabaseHas('product_translations', [
            'product_id' => $catalog['product']->id,
            'locale' => 'km',
            'name' => 'ឡាតេទឹកកក',
        ]);
    }

    public function test_cashier_and_waiter_cannot_update_translations(): void
    {
        $catalog = $this->createCatalog();
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);
        foreach ([$cashier, $waiter] as $staffUser) {
            $catalog['shop']->staffAssignments()->create([
                'branch_id' => null,
                'user_id' => $staffUser->id,
                'role' => $staffUser->role,
                'status' => 'active',
            ]);
        }

        $payload = [
            'translations' => [
                'en' => ['name' => 'Iced Latte'],
                'km' => ['name' => 'ឡាតេទឹកកក'],
            ],
        ];

        Sanctum::actingAs($cashier);
        $this->putJson("/api/products/{$catalog['product']->id}/translations", $payload)
            ->assertForbidden();

        Sanctum::actingAs($waiter);
        $this->putJson("/api/categories/{$catalog['category']->id}/translations", [
            'translations' => [
                'en' => ['name' => 'Coffee'],
                'km' => ['name' => 'កាហ្វេ'],
            ],
        ])
            ->assertForbidden();
    }

    public function test_translation_locale_is_unique_per_entity(): void
    {
        $catalog = $this->createCatalog();

        $catalog['product']->translations()->create([
            'locale' => 'km',
            'name' => 'ឡាតេទឹកកក',
        ]);

        $this->expectException(QueryException::class);

        $catalog['product']->translations()->create([
            'locale' => 'km',
            'name' => 'ឡាតេ',
        ]);
    }

    public function test_order_totals_use_billing_settings_and_receipt_returns_totals(): void
    {
        $catalog = $this->createCatalog();
        $catalog['shop']->settings()->createMany([
            ['key' => 'base_currency', 'value' => 'KHR'],
            ['key' => 'display_secondary_currency', 'value' => '1'],
            ['key' => 'secondary_currency', 'value' => 'USD'],
            ['key' => 'exchange_rate', 'value' => '4000'],
            ['key' => 'default_discount_percentage', 'value' => '10'],
            ['key' => 'service_charge_percentage', 'value' => '5'],
            ['key' => 'tax_percentage', 'value' => '10'],
            ['key' => 'receipt_prefix', 'value' => 'RCPT'],
        ]);

        $order = $this->submitOrder($catalog)
            ->assertCreated()
            ->assertJsonPath('data.order.subtotal', '14500.00')
            ->assertJsonPath('data.order.discount_total', '1450.00')
            ->assertJsonPath('data.order.service_charge', '652.50')
            ->assertJsonPath('data.order.tax_total', '1305.00')
            ->assertJsonPath('data.order.grand_total', '15007.50')
            ->assertJsonPath('data.order.currency_code', 'KHR')
            ->assertJsonPath('data.order.secondary_currency_code', 'USD')
            ->json('data.order');

        Sanctum::actingAs($catalog['owner']);

        $this->getJson("/api/orders/{$order['id']}/receipt")
            ->assertOk()
            ->assertJsonPath('data.receipt.receipt_number', 'RCPT-'.$order['order_number'])
            ->assertJsonPath('data.receipt.totals.grand_total', '15007.50')
            ->assertJsonPath('data.receipt.totals.secondary_currency_code', 'USD');
    }

    public function test_invoice_creation_copies_items_and_uses_unique_number(): void
    {
        $catalog = $this->createCatalog();
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        Sanctum::actingAs($catalog['owner']);

        $invoice = $this->postJson("/api/orders/{$order['id']}/invoice")
            ->assertCreated()
            ->assertJsonPath('data.invoice.order_id', $order['id'])
            ->assertJsonCount(1, 'data.invoice.items')
            ->json('data.invoice');

        $this->assertNotEmpty($invoice['invoice_number']);
        $this->assertDatabaseHas('invoice_items', [
            'invoice_id' => $invoice['id'],
            'product_name' => 'Iced Latte',
            'quantity' => 1,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'invoice.created',
            'entity_type' => 'invoice',
            'entity_id' => $invoice['id'],
        ]);

        $this->postJson("/api/orders/{$order['id']}/invoice")
            ->assertOk()
            ->assertJsonPath('data.invoice.id', $invoice['id']);

        $this->assertSame(1, Invoice::where('order_id', $order['id'])->count());
    }

    public function test_cashier_can_mark_invoice_paid_but_waiter_cannot(): void
    {
        $catalog = $this->createCatalog();
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);
        foreach ([$cashier, $waiter] as $staffUser) {
            $catalog['shop']->staffAssignments()->create([
                'branch_id' => $catalog['branch']->id,
                'user_id' => $staffUser->id,
                'role' => $staffUser->role,
                'status' => 'active',
            ]);
        }

        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');
        Sanctum::actingAs($catalog['owner']);
        $invoice = $this->postJson("/api/orders/{$order['id']}/invoice")->assertCreated()->json('data.invoice');

        Sanctum::actingAs($waiter);
        $this->putJson("/api/invoices/{$invoice['id']}/mark-paid")
            ->assertForbidden();

        Sanctum::actingAs($cashier);
        $this->putJson("/api/invoices/{$invoice['id']}/mark-paid")
            ->assertOk()
            ->assertJsonPath('data.invoice.status', 'paid')
            ->assertJsonPath('data.invoice.balance_due', '0.00');

        $this->assertDatabaseHas('orders', [
            'id' => $order['id'],
            'payment_status' => 'paid',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'invoice.marked_paid',
            'entity_type' => 'invoice',
            'entity_id' => $invoice['id'],
        ]);
    }

    public function test_bakong_khqr_initiation_uses_backend_amount_and_returns_qr_data(): void
    {
        $catalog = $this->createCatalog();
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'bakong_khqr',
            'amount' => 1,
        ])
            ->assertCreated()
            ->assertJsonPath('data.next_action', 'show_qr')
            ->assertJsonPath('data.payment.provider', 'bakong_khqr')
            ->assertJsonPath('data.payment.amount', '14500.00')
            ->assertJsonPath('data.payment.currency_code', 'KHR')
            ->assertJsonPath('data.payment.status', 'pending')
            ->assertJsonStructure(['data' => ['qr_payload']]);

        $payment = Payment::where('order_id', $order['id'])->firstOrFail();
        $this->assertStringContainsString($order['order_number'], $payment->qr_payload);
        $this->assertSame('bakong_khqr', $payment->provider);
    }

    public function test_invalid_bakong_webhook_signature_is_rejected(): void
    {
        config(['payment.bakong_khqr.webhook_secret' => 'test-secret']);

        $this->postJson('/api/webhooks/bakong-khqr', [
            'provider_reference' => 'BKHQR-INVALID',
            'status' => 'paid',
        ], ['X-Bakong-Signature' => 'bad-signature'])
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_valid_bakong_webhook_marks_payment_order_and_invoice_paid(): void
    {
        config(['payment.bakong_khqr.webhook_secret' => 'test-secret']);
        $catalog = $this->createCatalog();
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        Sanctum::actingAs($catalog['owner']);
        $invoice = $this->postJson("/api/orders/{$order['id']}/invoice")
            ->assertCreated()
            ->json('data.invoice');

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'bakong_khqr',
        ])->assertCreated();
        $payment = Payment::where('order_id', $order['id'])->firstOrFail();

        $payload = [
            'provider_reference' => $payment->provider_reference,
            'provider_payment_id' => $payment->provider_payment_id,
            'status' => 'paid',
            'amount' => 14500,
            'currency_code' => 'KHR',
        ];
        $json = json_encode($payload);
        $signature = hash_hmac('sha256', $json, 'test-secret');

        $this->call('POST', '/api/webhooks/bakong-khqr', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_BAKONG_SIGNATURE' => $signature,
        ], $json)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'paid',
            'provider' => 'bakong_khqr',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order['id'],
            'payment_status' => 'paid',
        ]);
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice['id'],
            'status' => 'paid',
            'balance_due' => 0,
        ]);
        $this->assertDatabaseHas('payment_logs', [
            'payment_id' => $payment->id,
            'action' => 'bakong_paid',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payment.webhook_paid',
            'entity_type' => 'payment',
            'entity_id' => $payment->id,
        ]);
    }

    public function test_cashier_can_manage_bakong_payment_but_waiter_cannot_confirm(): void
    {
        $catalog = $this->createCatalog();
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);
        foreach ([$cashier, $waiter] as $staffUser) {
            $catalog['shop']->staffAssignments()->create([
                'branch_id' => $catalog['branch']->id,
                'user_id' => $staffUser->id,
                'role' => $staffUser->role,
                'status' => 'active',
            ]);
        }

        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');
        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'bakong_khqr',
        ])->assertCreated();
        $payment = Payment::where('order_id', $order['id'])->firstOrFail();

        Sanctum::actingAs($waiter);
        $this->putJson("/api/payments/{$payment->id}/confirm")->assertForbidden();

        Sanctum::actingAs($cashier);
        $this->getJson('/api/payments')
            ->assertOk()
            ->assertJsonFragment(['provider' => 'bakong_khqr']);
        $this->putJson("/api/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('data.payment.status', 'paid');
    }

    public function test_no_aba_payway_provider_config_or_routes_are_introduced(): void
    {
        $this->assertFalse(class_exists(\App\Services\Payments\AbaPayWayProvider::class));
        $this->assertArrayNotHasKey('aba_payway', config('payment'));

        $uris = collect(app('router')->getRoutes())->map(fn ($route) => $route->uri())->all();
        $this->assertFalse(collect($uris)->contains(fn (string $uri) => str_contains(strtolower($uri), 'aba')));
    }

    public function test_telegram_order_notification_log_is_created_for_new_order(): void
    {
        config(['telegram.enabled' => true, 'telegram.sandbox_mode' => true]);
        $catalog = $this->createCatalog();
        $this->enableTelegram($catalog['shop'], order: true);

        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        $this->assertDatabaseHas('notification_logs', [
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
            'channel' => 'telegram',
            'event' => 'order.created',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'order.created',
            'recipient' => '123456',
        ]);
        $this->assertStringContainsString(
            $order['order_number'],
            (string) $catalog['shop']->notificationLogs()->where('event', 'order.created')->latest()->first()?->message_preview
        );
    }

    public function test_telegram_notification_is_skipped_when_disabled(): void
    {
        config(['telegram.enabled' => false, 'telegram.sandbox_mode' => true]);
        $catalog = $this->createCatalog();

        $this->submitOrder($catalog)->assertCreated();

        $this->assertDatabaseHas('notification_logs', [
            'shop_id' => $catalog['shop']->id,
            'event' => 'order.created',
            'status' => 'skipped',
            'error_message' => 'Telegram is disabled globally.',
        ]);
    }

    public function test_telegram_payment_proof_upload_notification_log_is_created(): void
    {
        Storage::fake('public');
        config(['telegram.enabled' => true, 'telegram.sandbox_mode' => true]);
        $catalog = $this->createCatalog();
        $this->enableTelegram($catalog['shop'], payment: true);
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'khqr_manual',
            'transaction_reference' => 'KHQR-100',
            'proof_image' => $this->fakeProofImage(),
        ])->assertCreated();

        $this->assertDatabaseHas('notification_logs', [
            'shop_id' => $catalog['shop']->id,
            'event' => 'payment.proof_uploaded',
            'status' => 'sent',
        ]);
    }

    public function test_telegram_bakong_paid_webhook_notification_log_is_created(): void
    {
        config([
            'telegram.enabled' => true,
            'telegram.sandbox_mode' => true,
            'payment.bakong_khqr.webhook_secret' => 'test-secret',
        ]);
        $catalog = $this->createCatalog();
        $this->enableTelegram($catalog['shop'], payment: true, invoice: true);
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        Sanctum::actingAs($catalog['owner']);
        $this->postJson("/api/orders/{$order['id']}/invoice")->assertCreated();

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'bakong_khqr',
        ])->assertCreated();
        $payment = Payment::where('order_id', $order['id'])->firstOrFail();

        $payload = [
            'provider_reference' => $payment->provider_reference,
            'provider_payment_id' => $payment->provider_payment_id,
            'status' => 'paid',
            'amount' => 14500,
            'currency_code' => 'KHR',
        ];
        $json = json_encode($payload);

        $this->call('POST', '/api/webhooks/bakong-khqr', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_BAKONG_SIGNATURE' => hash_hmac('sha256', $json, 'test-secret'),
        ], $json)->assertOk();

        $this->assertDatabaseHas('notification_logs', [
            'shop_id' => $catalog['shop']->id,
            'event' => 'payment.paid',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notification_logs', [
            'shop_id' => $catalog['shop']->id,
            'event' => 'invoice.paid',
            'status' => 'sent',
        ]);
    }

    public function test_telegram_invoice_paid_notification_log_is_created(): void
    {
        config(['telegram.enabled' => true, 'telegram.sandbox_mode' => true]);
        $catalog = $this->createCatalog();
        $this->enableTelegram($catalog['shop'], invoice: true);
        $cashier = User::factory()->create(['role' => 'cashier']);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $cashier->id,
            'role' => 'cashier',
            'status' => 'active',
        ]);
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');

        Sanctum::actingAs($catalog['owner']);
        $invoice = $this->postJson("/api/orders/{$order['id']}/invoice")->assertCreated()->json('data.invoice');

        Sanctum::actingAs($cashier);
        $this->putJson("/api/invoices/{$invoice['id']}/mark-paid")->assertOk();

        $this->assertDatabaseHas('notification_logs', [
            'shop_id' => $catalog['shop']->id,
            'event' => 'invoice.paid',
            'status' => 'sent',
        ]);
    }

    public function test_telegram_test_endpoint_works_in_sandbox_and_does_not_expose_token(): void
    {
        config([
            'telegram.enabled' => true,
            'telegram.sandbox_mode' => true,
            'telegram.bot_token' => 'secret-bot-token',
        ]);
        $catalog = $this->createCatalog();
        $this->enableTelegram($catalog['shop']);

        Sanctum::actingAs($catalog['owner']);
        $response = $this->postJson("/api/shops/{$catalog['shop']->id}/notifications/test-telegram")
            ->assertOk()
            ->assertJsonPath('data.notification.status', 'sent')
            ->assertJsonMissing(['secret-bot-token']);

        $this->assertStringNotContainsString('secret-bot-token', $response->getContent());
        $this->assertDatabaseMissing('notification_logs', [
            'message_preview' => 'secret-bot-token',
        ]);
    }

    public function test_cashier_and_waiter_cannot_update_or_test_telegram_settings(): void
    {
        $catalog = $this->createCatalog();
        $cashier = User::factory()->create(['role' => 'cashier']);
        $waiter = User::factory()->create(['role' => 'waiter']);
        foreach ([$cashier, $waiter] as $staffUser) {
            $catalog['shop']->staffAssignments()->create([
                'branch_id' => $catalog['branch']->id,
                'user_id' => $staffUser->id,
                'role' => $staffUser->role,
                'status' => 'active',
            ]);
        }

        foreach ([$cashier, $waiter] as $staffUser) {
            Sanctum::actingAs($staffUser);
            $this->postJson("/api/shops/{$catalog['shop']->id}/settings", [
                'name' => $catalog['shop']->name,
                'currency_code' => 'KHR',
                'telegram_enabled' => true,
                'telegram_chat_id' => '123456',
            ])->assertForbidden();
            $this->postJson("/api/shops/{$catalog['shop']->id}/notifications/test-telegram")
                ->assertForbidden();
        }
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

    private function enableTelegram(Shop $shop, bool $order = false, bool $payment = false, bool $invoice = false): void
    {
        $shop->settings()->updateOrCreate(['key' => 'telegram_enabled'], ['value' => '1']);
        $shop->settings()->updateOrCreate(['key' => 'telegram_chat_id'], ['value' => '123456']);
        $shop->settings()->updateOrCreate(['key' => 'telegram_order_notifications'], ['value' => $order ? '1' : '0']);
        $shop->settings()->updateOrCreate(['key' => 'telegram_payment_notifications'], ['value' => $payment ? '1' : '0']);
        $shop->settings()->updateOrCreate(['key' => 'telegram_invoice_notifications'], ['value' => $invoice ? '1' : '0']);
    }
}
