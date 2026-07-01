<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    private const STATUSES = ['visible', 'hidden', 'reviewed'];

    public function index(Request $request, Shop $shop)
    {
        $this->authorizeReviewView($request, $shop);

        $validated = $request->validate([
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $query = $shop->reviews()
            ->with(['branch:id,name', 'order:id,order_number,shop_id,branch_id,order_status,payment_status'])
            ->when($validated['rating'] ?? null, fn ($reviewQuery, $rating) => $reviewQuery->where('rating', $rating))
            ->when($validated['status'] ?? null, fn ($reviewQuery, $status) => $reviewQuery->where('status', $status))
            ->when($validated['date_from'] ?? null, fn ($reviewQuery, $date) => $reviewQuery->whereDate('created_at', '>=', $date))
            ->when($validated['date_to'] ?? null, fn ($reviewQuery, $date) => $reviewQuery->whereDate('created_at', '<=', $date));

        $this->scopeBranchAccess($request, $query, $shop->id);

        $summaryQuery = clone $query;
        $paginator = $query->latest()->paginate($this->paginationLimit($request, 15, 50));

        return $this->success('Reviews loaded', [
            'reviews' => collect($paginator->items())->map(fn (Review $review) => $this->adminPayload($review))->values()->all(),
            'summary' => $this->summary($summaryQuery),
            'pagination' => $this->paginationMeta($paginator),
        ]);
    }

    public function publicIndex(Request $request, string $slug)
    {
        $shop = Shop::where('slug', $slug)->where('status', 'active')->first();

        if (! $shop) {
            return $this->error('Shop not found', null, 404);
        }

        $query = $shop->reviews()->where('status', 'visible');
        $paginator = (clone $query)->latest()->paginate($this->paginationLimit($request, 10, 20));

        return $this->success('Reviews loaded', [
            'reviews' => collect($paginator->items())->map(fn (Review $review) => $this->publicPayload($review))->values()->all(),
            'summary' => $this->publicSummary($query),
            'pagination' => $this->paginationMeta($paginator),
        ]);
    }

    public function store(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->order_status !== 'completed' || $order->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'order' => ['Reviews are available after the order is completed and paid.'],
            ]);
        }

        if ($order->review()->exists()) {
            throw ValidationException::withMessages([
                'order' => ['This order has already been reviewed.'],
            ]);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = Review::create([
            'shop_id' => $order->shop_id,
            'branch_id' => $order->branch_id,
            'order_id' => $order->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'status' => 'visible',
        ]);

        return $this->success('Review submitted', [
            'review' => $this->publicPayload($review),
        ], 201);
    }

    public function updateStatus(Request $request, Review $review)
    {
        $this->authorizeReviewManagement($request, $review);

        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        $review->update([
            'status' => $validated['status'],
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        $this->audit($request, 'review.status_updated', $review->shop_id, 'review', $review->id, [
            'order_id' => $review->order_id,
            'status' => $review->status,
        ]);

        return $this->success('Review status updated', [
            'review' => $this->adminPayload($review->fresh(['branch:id,name', 'order:id,order_number,shop_id,branch_id,order_status,payment_status'])),
        ]);
    }

    private function authorizeReviewView(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canViewReviews(), 403);
    }

    private function authorizeReviewManagement(Request $request, Review $review): void
    {
        abort_unless($request->user()->canAccessShop($review->shop_id, $review->branch_id), 403);
        abort_unless($request->user()->canManageReviews(), 403);
    }

    private function adminPayload(Review $review): array
    {
        return [
            'id' => $review->id,
            'shop_id' => $review->shop_id,
            'branch_id' => $review->branch_id,
            'branch' => $review->branch ? ['id' => $review->branch->id, 'name' => $review->branch->name] : null,
            'order' => $review->order ? [
                'id' => $review->order->id,
                'order_number' => $review->order->order_number,
                'order_status' => $review->order->order_status,
                'payment_status' => $review->order->payment_status,
            ] : null,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'status' => $review->status,
            'created_at' => $review->created_at,
            'reviewed_at' => $review->reviewed_at,
        ];
    }

    private function publicPayload(Review $review): array
    {
        return [
            'rating' => $review->rating,
            'comment' => $review->comment,
            'status' => $review->status,
            'created_at' => $review->created_at,
        ];
    }

    private function summary($query): array
    {
        $base = clone $query;
        $count = (clone $base)->count();
        $average = $count ? round((float) (clone $base)->avg('rating'), 1) : 0.0;

        return [
            'count' => $count,
            'average_rating' => $average,
            'visible_count' => (clone $base)->where('status', 'visible')->count(),
            'hidden_count' => (clone $base)->where('status', 'hidden')->count(),
            'reviewed_count' => (clone $base)->where('status', 'reviewed')->count(),
        ];
    }

    private function publicSummary($query): array
    {
        $base = clone $query;
        $count = (clone $base)->count();

        return [
            'average_rating' => $count ? round((float) (clone $base)->avg('rating'), 1) : 0,
            'total_reviews' => $count,
        ];
    }
}
