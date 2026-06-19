<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_applied_to_api_responses(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    }

    public function test_inactive_and_suspended_users_cannot_login(): void
    {
        foreach (['inactive', 'suspended'] as $status) {
            $user = User::factory()->create([
                'email' => "{$status}@example.test",
                'password' => Hash::make('password'),
                'status' => $status,
            ]);

            $this->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'password',
            ])
                ->assertUnprocessable()
                ->assertJsonPath('message', 'Validation failed')
                ->assertJsonPath('errors.email.0', 'The provided credentials are incorrect.');

            $this->assertDatabaseHas('audit_logs', [
                'action' => 'login.blocked',
                'entity_type' => 'user',
                'entity_id' => $user->id,
            ]);
        }
    }

    public function test_login_rate_limit_blocks_repeated_failures(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.40'])
                ->postJson('/api/auth/login', [
                    'email' => 'rate-limit@example.test',
                    'password' => 'wrong-password',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.40'])
            ->postJson('/api/auth/login', [
                'email' => 'rate-limit@example.test',
                'password' => 'wrong-password',
            ])
            ->assertTooManyRequests();
    }

    public function test_public_order_totals_ignore_client_price_tampering_and_status_payload_is_safe(): void
    {
        $catalog = $this->createCatalog();

        $order = $this->postJson('/api/public/orders', [
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
            'customer_name' => 'Private Customer',
            'customer_phone' => '+85510000004',
            'order_type' => 'dine_in',
            'grand_total' => 1,
            'items' => [
                [
                    'product_id' => $catalog['product']->id,
                    'quantity' => 1,
                    'unit_price' => 1,
                    'total_price' => 1,
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
        ])
            ->assertCreated()
            ->assertJsonPath('data.order.grand_total', '14500.00')
            ->assertJsonMissingPath('data.order.customer_phone')
            ->json('data.order');

        $this->assertDatabaseHas('orders', [
            'id' => $order['id'],
            'grand_total' => 14500,
        ]);

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", [
            'payment_method' => 'cash',
        ])->assertCreated();

        $response = $this->getJson("/api/public/orders/{$order['order_number']}")
            ->assertOk()
            ->assertJsonMissingPath('data.order.customer_name')
            ->assertJsonMissingPath('data.order.customer_phone')
            ->assertJsonMissingPath('data.order.payment.proof_image_path')
            ->assertJsonMissingPath('data.order.payment.provider_payment_id');

        $this->assertStringNotContainsString('Private Customer', $response->getContent());
        $this->assertStringNotContainsString('+85510000004', $response->getContent());
    }

    public function test_invalid_public_table_token_is_rejected(): void
    {
        $catalog = $this->createCatalog();

        $this->postJson('/api/public/orders', [
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
            'table_code' => 'invalid-token',
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
                    ],
                ],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.table_code.0', 'The selected table is not available for this branch.');
    }

    public function test_order_and_payment_lists_are_paginated_with_compatible_arrays(): void
    {
        $catalog = $this->createCatalog();
        $firstOrder = $this->submitOrder($catalog);
        $secondOrder = $this->submitOrder($catalog);

        foreach ([$firstOrder, $secondOrder] as $order) {
            $this->postJson("/api/public/orders/{$order->order_number}/payment", [
                'payment_method' => 'cash',
            ])->assertCreated();
        }

        Sanctum::actingAs($catalog['owner']);

        $this->getJson('/api/orders?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.orders')
            ->assertJsonPath('data.pagination.per_page', 1)
            ->assertJsonPath('data.pagination.total', 2)
            ->assertJsonStructure(['data' => ['orders', 'summary', 'pagination']]);

        $this->getJson('/api/payments?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.payments')
            ->assertJsonPath('data.pagination.per_page', 1)
            ->assertJsonPath('data.pagination.total', 2)
            ->assertJsonStructure(['data' => ['payments', 'pagination']]);
    }

    public function test_public_menu_cache_invalidates_after_product_update(): void
    {
        Cache::flush();
        config(['cache.public_menu_ttl_seconds' => 300]);
        $catalog = $this->createCatalog();
        $url = "/api/public/shops/{$catalog['shop']->slug}/menu?branch={$catalog['branch']->id}";

        $this->getJson($url)
            ->assertOk()
            ->assertJsonPath('data.categories.0.products.0.name', 'Iced Latte');

        Sanctum::actingAs($catalog['owner']);
        $this->putJson("/api/products/{$catalog['product']->id}", [
            'category_id' => $catalog['category']->id,
            'name' => 'Fast Latte',
            'price' => 11000,
            'is_featured' => true,
            'is_available' => true,
            'status' => 'active',
        ])->assertOk();

        $this->getJson($url)
            ->assertOk()
            ->assertJsonPath('data.categories.0.products.0.name', 'Fast Latte');
    }

    public function test_payment_proof_rejects_scripts_and_oversized_files_and_stores_safe_filename(): void
    {
        Storage::fake('public');
        $catalog = $this->createCatalog();
        $order = $this->submitOrder($catalog);

        $this->postJson("/api/public/orders/{$order->order_number}/payment", [
            'payment_method' => 'khqr_manual',
            'proof_image' => UploadedFile::fake()->createWithContent('proof.php', '<?php echo "bad";'),
        ])->assertUnprocessable();

        $this->postJson("/api/public/orders/{$order->order_number}/payment", [
            'payment_method' => 'khqr_manual',
            'proof_image' => UploadedFile::fake()->createWithContent('proof.png', $this->pngBytes().str_repeat('a', 5000 * 1024)),
        ])->assertUnprocessable();

        $this->postJson("/api/public/orders/{$order->order_number}/payment", [
            'payment_method' => 'khqr_manual',
            'proof_image' => $this->fakeProofImage('original-proof.png'),
        ])->assertCreated();

        $payment = Payment::where('order_id', $order->id)->firstOrFail();
        $this->assertStringStartsWith('payments/', (string) $payment->proof_image_path);
        $this->assertStringNotContainsString('original-proof', (string) $payment->proof_image_path);
        $this->assertTrue(Storage::disk('public')->exists((string) $payment->proof_image_path));
    }

    public function test_cors_config_uses_explicit_origins_without_wildcards(): void
    {
        $this->assertContains('http://localhost:5173', config('cors.allowed_origins'));
        $this->assertContains('http://127.0.0.1:5173', config('cors.allowed_origins'));
        $this->assertNotContains('*', config('cors.allowed_origins'));
    }

    private function createCatalog(): array
    {
        $owner = User::factory()->create(['role' => 'shop_owner']);
        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Security Cafe',
            'slug' => 'security-cafe-'.Str::lower(Str::random(6)),
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

    private function submitOrder(array $catalog): Order
    {
        $order = $this->postJson('/api/public/orders', [
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
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
                    ],
                ],
            ],
        ])
            ->assertCreated()
            ->json('data.order');

        return Order::findOrFail($order['id']);
    }

    private function fakeProofImage(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, $this->pngBytes());
    }

    private function pngBytes(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=');
    }
}
