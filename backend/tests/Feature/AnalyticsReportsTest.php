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
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_summary_is_tenant_scoped_and_numbers_are_correct(): void
    {
        $catalog = $this->createCatalog('Owner Cafe');
        $otherCatalog = $this->createCatalog('Other Cafe');
        $completed = $this->createOrder($catalog, [
            'grand_total' => 20000,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'created_at' => now()->subDay(),
        ]);
        $this->createPayment($completed, 'cash', 20000, 'paid');
        $pending = $this->createOrder($catalog, [
            'grand_total' => 12000,
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'created_at' => now(),
        ]);
        $this->createPayment($pending, 'khqr_manual', 12000, 'pending');
        $this->createOrder($catalog, [
            'grand_total' => 9000,
            'order_status' => 'cancelled',
            'payment_status' => 'unpaid',
            'created_at' => now(),
        ]);
        $otherOrder = $this->createOrder($otherCatalog, [
            'grand_total' => 99999,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'created_at' => now(),
        ]);
        $this->createPayment($otherOrder, 'cash', 99999, 'paid');

        Sanctum::actingAs($catalog['owner']);

        $this->getJson("/api/reports/summary?shop_id={$catalog['shop']->id}&period=last_7_days")
            ->assertOk()
            ->assertJsonPath('data.summary.total_sales', 20000)
            ->assertJsonPath('data.summary.order_count', 2)
            ->assertJsonPath('data.summary.average_order_value', 16000)
            ->assertJsonPath('data.summary.pending_orders', 1)
            ->assertJsonPath('data.summary.completed_orders', 1)
            ->assertJsonPath('data.summary.cancelled_orders', 1)
            ->assertJsonPath('data.summary.paid_amount', 20000)
            ->assertJsonPath('data.summary.unpaid_amount', 12000)
            ->assertJsonPath('data.summary.pending_payments', 1);
    }

    public function test_branch_and_date_filters_apply_to_analytics(): void
    {
        $catalog = $this->createCatalog('Branch Cafe');
        $otherBranch = Branch::create([
            'shop_id' => $catalog['shop']->id,
            'name' => 'Side Branch',
            'status' => 'active',
        ]);
        $included = $this->createOrder($catalog, [
            'grand_total' => 15000,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'created_at' => now()->subDays(2),
        ]);
        $this->createPayment($included, 'cash', 15000, 'paid');
        $this->createOrder($catalog, [
            'branch_id' => $otherBranch->id,
            'grand_total' => 30000,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'created_at' => now()->subDays(2),
        ]);
        $this->createOrder($catalog, [
            'grand_total' => 8000,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'created_at' => now()->subDays(10),
        ]);

        Sanctum::actingAs($catalog['owner']);
        $query = http_build_query([
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $catalog['branch']->id,
            'period' => 'custom',
            'date_from' => now()->subDays(3)->toDateString(),
            'date_to' => now()->toDateString(),
        ]);

        $this->getJson("/api/reports/summary?{$query}")
            ->assertOk()
            ->assertJsonPath('data.summary.total_sales', 15000)
            ->assertJsonPath('data.summary.order_count', 1);

        $this->getJson("/api/reports/branch-performance?{$query}")
            ->assertOk()
            ->assertJsonCount(1, 'data.branch_performance')
            ->assertJsonPath('data.branch_performance.0.branch_id', $catalog['branch']->id);
    }

    public function test_top_products_and_payment_method_reports_are_aggregated(): void
    {
        $catalog = $this->createCatalog('Product Cafe');
        $orderOne = $this->createOrder($catalog, [
            'grand_total' => 25000,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'skip_items' => true,
        ]);
        $orderOne->items()->create([
            'product_id' => $catalog['product']->id,
            'product_name' => 'Iced Latte',
            'quantity' => 2,
            'unit_price' => 10000,
            'total_price' => 20000,
        ]);
        $orderTwo = $this->createOrder($catalog, [
            'grand_total' => 10000,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'skip_items' => true,
        ]);
        $orderTwo->items()->create([
            'product_id' => $catalog['product']->id,
            'product_name' => 'Iced Latte',
            'quantity' => 1,
            'unit_price' => 10000,
            'total_price' => 10000,
        ]);
        $this->createPayment($orderOne, 'cash', 25000, 'paid');
        $this->createPayment($orderTwo, 'bakong_khqr', 10000, 'paid');

        Sanctum::actingAs($catalog['owner']);

        $this->getJson("/api/reports/top-products?shop_id={$catalog['shop']->id}&period=today")
            ->assertOk()
            ->assertJsonPath('data.top_products.0.product_name', 'Iced Latte')
            ->assertJsonPath('data.top_products.0.quantity_sold', 3)
            ->assertJsonPath('data.top_products.0.revenue', 30000);

        $this->getJson("/api/reports/analytics?shop_id={$catalog['shop']->id}&period=today")
            ->assertOk()
            ->assertJsonPath('data.reports.payment_methods.0.method', 'cash')
            ->assertJsonPath('data.reports.payment_methods.0.paid_total', 25000)
            ->assertJsonPath('data.reports.payment_methods.2.method', 'bakong_khqr')
            ->assertJsonPath('data.reports.payment_methods.2.paid_total', 10000);
    }

    public function test_report_access_is_role_and_tenant_limited(): void
    {
        $catalog = $this->createCatalog('Secure Cafe');
        $otherOwner = User::factory()->create(['role' => 'shop_owner']);
        $waiter = User::factory()->create(['role' => 'waiter']);
        $catalog['shop']->staffAssignments()->create([
            'branch_id' => $catalog['branch']->id,
            'user_id' => $waiter->id,
            'role' => 'waiter',
            'status' => 'active',
        ]);

        Sanctum::actingAs($otherOwner);
        $this->getJson("/api/reports/summary?shop_id={$catalog['shop']->id}")
            ->assertForbidden();

        Sanctum::actingAs($waiter);
        $this->getJson("/api/reports/summary?shop_id={$catalog['shop']->id}&branch_id={$catalog['branch']->id}")
            ->assertForbidden();
    }

    public function test_empty_reports_return_safe_zero_payloads(): void
    {
        $catalog = $this->createCatalog('Empty Cafe');
        Sanctum::actingAs($catalog['owner']);

        $this->getJson("/api/reports/analytics?shop_id={$catalog['shop']->id}&period=today")
            ->assertOk()
            ->assertJsonPath('data.reports.summary.total_sales', 0)
            ->assertJsonPath('data.reports.summary.order_count', 0)
            ->assertJsonPath('data.reports.top_products', [])
            ->assertJsonPath('data.reports.branch_performance', []);
    }

    private function createCatalog(string $shopName): array
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
            'is_available' => true,
            'status' => 'active',
        ]);

        return compact('owner', 'shop', 'branch', 'category', 'product');
    }

    private function createOrder(array $catalog, array $attributes = []): Order
    {
        $createdAt = $attributes['created_at'] ?? now();
        $order = Order::create([
            'order_number' => 'ORD-'.Str::upper(Str::random(8)),
            'shop_id' => $catalog['shop']->id,
            'branch_id' => $attributes['branch_id'] ?? $catalog['branch']->id,
            'order_type' => 'dine_in',
            'subtotal' => $attributes['grand_total'] ?? 10000,
            'discount_total' => 0,
            'service_charge' => 0,
            'tax_total' => 0,
            'grand_total' => $attributes['grand_total'] ?? 10000,
            'currency_code' => 'KHR',
            'payment_status' => $attributes['payment_status'] ?? 'unpaid',
            'order_status' => $attributes['order_status'] ?? 'pending',
        ]);
        $order->forceFill(['created_at' => $createdAt, 'updated_at' => $createdAt])->saveQuietly();

        if (! ($attributes['skip_items'] ?? false) && ! $order->items()->exists()) {
            $order->items()->create([
                'product_id' => $catalog['product']->id,
                'product_name' => $catalog['product']->name,
                'quantity' => 1,
                'unit_price' => $order->grand_total,
                'total_price' => $order->grand_total,
            ]);
        }

        return $order;
    }

    private function createPayment(Order $order, string $method, float $amount, string $status): Payment
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'shop_id' => $order->shop_id,
            'branch_id' => $order->branch_id,
            'payment_method' => $method,
            'provider' => $method === 'bakong_khqr' ? 'bakong_khqr' : 'manual',
            'amount' => $amount,
            'currency_code' => $order->currency_code,
            'status' => $status,
        ]);
        $payment->forceFill(['created_at' => $order->created_at, 'updated_at' => $order->created_at])->saveQuietly();

        return $payment;
    }
}
