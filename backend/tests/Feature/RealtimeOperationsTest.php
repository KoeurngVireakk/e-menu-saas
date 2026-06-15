<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\PaymentConfirmed;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tests\TestCase;

class RealtimeOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcast_payloads_are_safe_and_operational_only(): void
    {
        $catalog = $this->createCatalog();
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');
        $orderModel = Order::findOrFail($order['id']);

        $payload = (new OrderCreated($orderModel))->broadcastWith();

        $this->assertSame($orderModel->id, $payload['order_id']);
        $this->assertSame($orderModel->order_number, $payload['order_number']);
        $this->assertArrayNotHasKey('customer_phone', $payload);
        $this->assertArrayNotHasKey('customer_name', $payload);
        $this->assertArrayNotHasKey('note', $payload);
    }

    public function test_private_channel_authorization_is_tenant_aware(): void
    {
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'menudigi-key',
            'broadcasting.connections.reverb.secret' => 'menudigi-secret',
            'broadcasting.connections.reverb.app_id' => 'menudigi-local',
        ]);

        $catalog = $this->createCatalog();
        $manager = User::factory()->create(['role' => 'manager']);
        $unrelatedOwner = User::factory()->create(['role' => 'shop_owner']);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);

        require base_path('routes/channels.php');

        $this->assertBroadcastAuthAllowed($manager, 'private-branch.'.$catalog['branch']->id);
        $this->assertBroadcastAuthAllowed($manager, 'private-admin.restaurant.'.$catalog['shop']->id);
        $this->assertBroadcastAuthForbidden($unrelatedOwner, 'private-branch.'.$catalog['branch']->id);
    }

    public function test_order_and_payment_flows_dispatch_realtime_events(): void
    {
        Event::fake([
            OrderCreated::class,
            OrderStatusChanged::class,
            PaymentConfirmed::class,
        ]);

        $catalog = $this->createCatalog();
        $order = $this->submitOrder($catalog)->assertCreated()->json('data.order');
        Event::assertDispatched(OrderCreated::class, fn (OrderCreated $event) => $event->order->id === $order['id']);

        Sanctum::actingAs($catalog['owner']);
        $this->putJson("/api/orders/{$order['id']}/status", ['order_status' => 'accepted'])
            ->assertOk();
        Event::assertDispatched(OrderStatusChanged::class, fn (OrderStatusChanged $event) => $event->order->id === $order['id'] && $event->oldStatus === 'pending');

        $this->postJson("/api/public/orders/{$order['order_number']}/payment", ['payment_method' => 'cash'])
            ->assertCreated();
        $payment = Payment::where('order_id', $order['id'])->firstOrFail();

        $this->putJson("/api/payments/{$payment->id}/confirm")
            ->assertOk();
        Event::assertDispatched(PaymentConfirmed::class, fn (PaymentConfirmed $event) => $event->payment->id === $payment->id);
    }

    private function createCatalog(string $shopName = 'Realtime Cafe'): array
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

        return compact('owner', 'shop', 'branch', 'category', 'product');
    }

    private function submitOrder(array $catalog)
    {
        return $this->postJson('/api/public/orders', [
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
            'customer_name' => 'Realtime Customer',
            'customer_phone' => '+85510000007',
            'order_type' => 'dine_in',
            'items' => [
                [
                    'product_id' => $catalog['product']->id,
                    'quantity' => 1,
                ],
            ],
        ]);
    }

    private function assertBroadcastAuthAllowed(User $user, string $channelName): void
    {
        $request = Request::create('/api/broadcasting/auth', 'POST', [
            'socket_id' => '123.456',
            'channel_name' => $channelName,
        ]);
        $request->setUserResolver(fn () => $user);

        $response = Broadcast::auth($request);

        $this->assertArrayHasKey('auth', $response);
    }

    private function assertBroadcastAuthForbidden(User $user, string $channelName): void
    {
        $request = Request::create('/api/broadcasting/auth', 'POST', [
            'socket_id' => '123.456',
            'channel_name' => $channelName,
        ]);
        $request->setUserResolver(fn () => $user);

        $this->expectException(AccessDeniedHttpException::class);

        Broadcast::auth($request);
    }
}
