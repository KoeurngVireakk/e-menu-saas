<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Order;
use App\Models\Review;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicReviewsEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_reviews_endpoint_returns_empty_list_when_shop_has_no_reviews(): void
    {
        $shop = $this->createShop();

        $this->getJson("/api/public/shops/{$shop->slug}/reviews?per_page=3")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.reviews', [])
            ->assertJsonPath('data.summary.average_rating', 0)
            ->assertJsonPath('data.summary.total_reviews', 0)
            ->assertJsonPath('data.pagination.current_page', 1)
            ->assertJsonPath('data.pagination.per_page', 3)
            ->assertJsonPath('data.pagination.total', 0);
    }

    public function test_public_reviews_endpoint_returns_visible_reviews(): void
    {
        $shop = $this->createShop();
        $order = $this->createCompletedPaidOrder($shop, [
            'customer_name' => 'Private Customer',
            'customer_phone' => '+85510001111',
        ]);

        Review::create([
            'shop_id' => $shop->id,
            'branch_id' => $order->branch_id,
            'order_id' => $order->id,
            'rating' => 5,
            'comment' => 'Clean menu and fast kitchen.',
            'status' => 'visible',
        ]);

        $this->getJson("/api/public/shops/{$shop->slug}/reviews?per_page=3")
            ->assertOk()
            ->assertJsonPath('data.summary.average_rating', 5)
            ->assertJsonPath('data.summary.total_reviews', 1)
            ->assertJsonPath('data.reviews.0.rating', 5)
            ->assertJsonPath('data.reviews.0.comment', 'Clean menu and fast kitchen.')
            ->assertJsonPath('data.reviews.0.status', 'visible')
            ->assertJsonMissingPath('data.reviews.0.id')
            ->assertJsonMissingPath('data.reviews.0.order_id')
            ->assertJsonMissingPath('data.reviews.0.shop_id')
            ->assertJsonMissingPath('data.reviews.0.branch_id')
            ->assertJsonMissing(['customer_phone' => '+85510001111'])
            ->assertJsonMissing(['customer_name' => 'Private Customer']);
    }

    public function test_public_reviews_endpoint_hides_private_reviews(): void
    {
        $shop = $this->createShop();
        $visibleOrder = $this->createCompletedPaidOrder($shop, ['order_number' => 'PUB-VISIBLE']);
        $hiddenOrder = $this->createCompletedPaidOrder($shop, ['order_number' => 'PUB-HIDDEN']);

        Review::create([
            'shop_id' => $shop->id,
            'branch_id' => $visibleOrder->branch_id,
            'order_id' => $visibleOrder->id,
            'rating' => 4,
            'comment' => 'Visible public review.',
            'status' => 'visible',
        ]);

        Review::create([
            'shop_id' => $shop->id,
            'branch_id' => $hiddenOrder->branch_id,
            'order_id' => $hiddenOrder->id,
            'rating' => 1,
            'comment' => 'Hidden private review.',
            'status' => 'hidden',
        ]);

        $this->getJson("/api/public/shops/{$shop->slug}/reviews?per_page=3")
            ->assertOk()
            ->assertJsonCount(1, 'data.reviews')
            ->assertJsonPath('data.summary.total_reviews', 1)
            ->assertJsonPath('data.reviews.0.comment', 'Visible public review.')
            ->assertJsonMissing(['comment' => 'Hidden private review.']);
    }

    public function test_public_reviews_endpoint_returns_safe_404_for_unknown_shop_slug(): void
    {
        $this->getJson('/api/public/shops/unknown-shop/reviews?per_page=3')
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Shop not found');
    }

    private function createShop(array $attributes = []): Shop
    {
        return Shop::create(array_merge([
            'owner_id' => User::factory()->create(['role' => 'shop_owner'])->id,
            'name' => 'Public Review Cafe',
            'slug' => 'public-review-cafe',
            'phone' => '+85510000001',
            'email' => 'reviews@example.test',
            'address' => 'Phnom Penh',
            'status' => 'active',
        ], $attributes));
    }

    private function createCompletedPaidOrder(Shop $shop, array $attributes = []): Order
    {
        $branch = Branch::firstOrCreate(
            ['shop_id' => $shop->id, 'name' => 'Main Branch'],
            ['phone' => '+85510000002', 'address' => 'Phnom Penh', 'status' => 'active']
        );

        return Order::create(array_merge([
            'order_number' => 'PUB-'.Str::upper(Str::random(8)),
            'shop_id' => $shop->id,
            'branch_id' => $branch->id,
            'customer_name' => 'Review Customer',
            'customer_phone' => '+85510000003',
            'order_type' => 'dine_in',
            'subtotal' => 10000,
            'discount_total' => 0,
            'service_charge' => 0,
            'tax_total' => 0,
            'grand_total' => 10000,
            'payment_status' => 'paid',
            'order_status' => 'completed',
        ], $attributes));
    }
}
