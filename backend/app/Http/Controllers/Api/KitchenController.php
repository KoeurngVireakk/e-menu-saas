<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\KitchenEvent;
use App\Models\KitchenStation;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class KitchenController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->canViewKitchen(), 403);

        $filters = $this->filters($request);
        $categoryIds = $this->categoryIdsForFilter($request, $filters);

        $orders = $this->orderQuery($request, $filters, $categoryIds)
            ->latest()
            ->get()
            ->map(fn (Order $order) => $this->orderPayload($order, $categoryIds))
            ->values();

        return $this->success('Kitchen orders loaded', [
            'orders' => $orders,
            'summary' => [
                'new_count' => $orders->where('order_status', 'pending')->count(),
                'active_count' => $orders->whereIn('order_status', ['pending', 'accepted', 'preparing'])->count(),
                'ready_count' => $orders->where('order_status', 'ready')->count(),
            ],
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $this->authorizeKitchenOrder($request, $order);

        return $this->success('Kitchen order loaded', [
            'order' => $this->orderPayload($order->load($this->orderRelations())),
        ]);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $this->authorizeKitchenOrder($request, $order);
        abort_unless($request->user()->canUpdateKitchenOrder(), 403);

        $validated = $request->validate([
            'order_status' => ['required', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $order = DB::transaction(function () use ($request, $order, $validated) {
            $previous = $order->order_status;
            $order->update(['order_status' => $validated['order_status']]);

            if ($validated['order_status'] === 'preparing') {
                $order->items()->where('kitchen_status', 'pending')->update(['kitchen_status' => 'preparing']);
            }

            if ($validated['order_status'] === 'ready') {
                $order->items()->whereNotIn('kitchen_status', ['ready', 'served', 'cancelled'])->update([
                    'kitchen_status' => 'ready',
                    'prepared_at' => now(),
                ]);
            }

            if ($validated['order_status'] === 'completed') {
                $order->items()->whereNotIn('kitchen_status', ['served', 'cancelled'])->update([
                    'kitchen_status' => 'served',
                    'served_at' => now(),
                ]);
            }

            if ($validated['order_status'] === 'cancelled') {
                $order->items()->where('kitchen_status', '!=', 'served')->update(['kitchen_status' => 'cancelled']);
            }

            $eventType = $this->orderEventType($validated['order_status']);
            $this->recordEvent($request, $order->fresh(), $eventType, metadata: [
                'from' => $previous,
                'to' => $validated['order_status'],
            ]);
            $this->audit($request, $this->orderAuditAction($validated['order_status']), $order->shop_id, 'order', $order->id, [
                'order_number' => $order->order_number,
                'from' => $previous,
                'to' => $validated['order_status'],
            ]);

            return $order->fresh($this->orderRelations());
        });

        return $this->success('Kitchen order updated', ['order' => $this->orderPayload($order)]);
    }

    public function updateItemStatus(Request $request, OrderItem $orderItem)
    {
        $orderItem->load('order');
        $this->authorizeKitchenOrder($request, $orderItem->order);
        abort_unless($request->user()->canUpdateKitchenOrder(), 403);

        $validated = $request->validate([
            'kitchen_status' => ['required', Rule::in(['pending', 'preparing', 'ready', 'served', 'cancelled'])],
        ]);

        $order = DB::transaction(function () use ($request, $orderItem, $validated) {
            $previous = $orderItem->kitchen_status;
            $attributes = ['kitchen_status' => $validated['kitchen_status']];
            if ($validated['kitchen_status'] === 'ready') {
                $attributes['prepared_at'] = now();
            }
            if ($validated['kitchen_status'] === 'served') {
                $attributes['served_at'] = now();
            }

            $orderItem->update($attributes);
            $order = $orderItem->order()->with('items')->firstOrFail();
            $this->syncOrderStatusFromItems($order);

            $eventType = $this->itemEventType($validated['kitchen_status']);
            $this->recordEvent($request, $order, $eventType, $orderItem->fresh(), [
                'from' => $previous,
                'to' => $validated['kitchen_status'],
                'product_name' => $orderItem->product_name,
            ]);
            $this->audit($request, 'kitchen.'.$eventType, $order->shop_id, 'order_item', $orderItem->id, [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'from' => $previous,
                'to' => $validated['kitchen_status'],
            ]);

            return $order->fresh($this->orderRelations());
        });

        return $this->success('Kitchen item updated', ['order' => $this->orderPayload($order)]);
    }

    public function events(Request $request)
    {
        abort_unless($request->user()->canViewKitchen(), 403);

        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'since_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        $date = $validated['date'] ?? now()->toDateString();
        $events = KitchenEvent::with(['order:id,order_number', 'orderItem:id,product_name', 'user:id,name'])
            ->whereIn('shop_id', $shopIds)
            ->whereDate('created_at', $date)
            ->when($validated['branch_id'] ?? null, fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->when($validated['since_id'] ?? null, fn ($query, $id) => $query->where('id', '>', $id));

        $events->where(function (Builder $query) use ($request, $shopIds) {
            foreach ($shopIds as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        return $this->success('Kitchen events loaded', [
            'events' => $events->latest('id')->limit(100)->get(),
        ]);
    }

    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'branch_id' => ['nullable', 'integer'],
            'station_id' => ['nullable', 'integer', 'exists:kitchen_stations,id'],
            'status' => ['nullable', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])],
            'date' => ['nullable', 'date'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $shopIds = $this->accessibleShopIds($request);
        if (isset($validated['shop_id'])) {
            abort_unless(in_array((int) $validated['shop_id'], $shopIds, true), 403);
            $shopIds = [(int) $validated['shop_id']];
        }

        return [
            'shop_id' => $validated['shop_id'] ?? null,
            'shop_ids' => $shopIds,
            'branch_id' => isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            'station_id' => isset($validated['station_id']) ? (int) $validated['station_id'] : null,
            'status' => $validated['status'] ?? null,
            'date' => $validated['date'] ?? now()->toDateString(),
            'category_id' => isset($validated['category_id']) ? (int) $validated['category_id'] : null,
        ];
    }

    private function categoryIdsForFilter(Request $request, array $filters): ?array
    {
        if ($filters['category_id']) {
            $category = Category::findOrFail($filters['category_id']);
            abort_unless($request->user()->canAccessShop($category->shop_id, $category->branch_id), 403);

            return [$category->id];
        }

        if (! $filters['station_id']) {
            return null;
        }

        $station = KitchenStation::findOrFail($filters['station_id']);
        abort_unless($request->user()->canAccessShop($station->shop_id, $station->branch_id), 403);
        $categoryIds = collect($station->category_ids_json ?? [])->map(fn ($id) => (int) $id)->filter()->values()->all();

        return empty($categoryIds) ? null : $categoryIds;
    }

    private function orderQuery(Request $request, array $filters, ?array $categoryIds = null): Builder
    {
        $orders = Order::with($this->orderRelations())
            ->whereIn('shop_id', $filters['shop_ids'])
            ->whereDate('created_at', $filters['date'])
            ->when($filters['branch_id'], fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->when($filters['status'], fn ($query, $status) => $query->where('order_status', $status))
            ->when(! $filters['status'], fn ($query) => $query->whereIn('order_status', ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']))
            ->when($categoryIds, fn ($query) => $query->whereHas('items.product', fn ($productQuery) => $productQuery->whereIn('category_id', $categoryIds)));

        $orders->where(function (Builder $query) use ($request, $filters) {
            foreach ($filters['shop_ids'] as $shopId) {
                $query->orWhere(function (Builder $shopQuery) use ($request, $shopId) {
                    $shopQuery->where('shop_id', $shopId);
                    $this->scopeBranchAccess($request, $shopQuery, $shopId);
                });
            }
        });

        return $orders;
    }

    private function authorizeKitchenOrder(Request $request, Order $order): void
    {
        abort_unless($request->user()->canViewKitchen(), 403);
        abort_unless($request->user()->canAccessShop($order->shop_id, $order->branch_id), 403);
    }

    private function syncOrderStatusFromItems(Order $order): void
    {
        $statuses = $order->items->pluck('kitchen_status');
        if ($statuses->isNotEmpty() && $statuses->every(fn ($status) => in_array($status, ['ready', 'served', 'cancelled'], true))) {
            $order->update(['order_status' => 'ready']);
            $this->recordSystemEvent($order, 'order_ready');
        }

        if ($statuses->isNotEmpty() && $statuses->every(fn ($status) => in_array($status, ['served', 'cancelled'], true))) {
            $order->update(['order_status' => 'completed']);
            $this->recordSystemEvent($order, 'order_served');
        }
    }

    private function orderPayload(Order $order, ?array $categoryIds = null): array
    {
        $createdAt = CarbonImmutable::parse($order->created_at);
        $items = $order->items
            ->filter(fn (OrderItem $item) => ! $categoryIds || in_array((int) $item->product?->category_id, $categoryIds, true))
            ->values()
            ->map(fn (OrderItem $item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'category_id' => $item->product?->category_id,
                'quantity' => $item->quantity,
                'note' => $item->note,
                'selected_options' => $item->selected_options_json ?? [],
                'kitchen_status' => $item->kitchen_status,
                'prepared_at' => $item->prepared_at,
                'served_at' => $item->served_at,
            ])
            ->all();

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'shop_id' => $order->shop_id,
            'branch_id' => $order->branch_id,
            'branch' => $order->branch,
            'dining_table' => $order->diningTable,
            'order_type' => $order->order_type,
            'note' => $order->note,
            'created_at' => $order->created_at,
            'elapsed_minutes' => $createdAt->diffInMinutes(now()),
            'items' => $items,
            'order_status' => $order->order_status,
            'payment_status' => $order->payment_status,
        ];
    }

    private function recordEvent(Request $request, Order $order, string $eventType, ?OrderItem $item = null, array $metadata = []): void
    {
        KitchenEvent::create([
            'shop_id' => $order->shop_id,
            'branch_id' => $order->branch_id,
            'order_id' => $order->id,
            'order_item_id' => $item?->id,
            'user_id' => $request->user()?->id,
            'event_type' => $eventType,
            'metadata_json' => $metadata,
            'created_at' => now(),
        ]);
    }

    private function recordSystemEvent(Order $order, string $eventType): void
    {
        KitchenEvent::firstOrCreate([
            'order_id' => $order->id,
            'event_type' => $eventType,
            'order_item_id' => null,
        ], [
            'shop_id' => $order->shop_id,
            'branch_id' => $order->branch_id,
            'user_id' => null,
            'metadata_json' => ['source' => 'item_status_sync'],
            'created_at' => now(),
        ]);
    }

    private function orderEventType(string $status): string
    {
        return match ($status) {
            'accepted' => 'order_received',
            'preparing' => 'order_preparing',
            'ready' => 'order_ready',
            'completed' => 'order_served',
            'cancelled' => 'cancelled',
            default => 'order_received',
        };
    }

    private function orderAuditAction(string $status): string
    {
        return match ($status) {
            'accepted' => 'kitchen.order_accepted',
            'preparing' => 'kitchen.order_preparing',
            'ready' => 'kitchen.order_ready',
            'completed' => 'kitchen.order_served',
            'cancelled' => 'kitchen.cancelled',
            default => 'kitchen.order_accepted',
        };
    }

    private function itemEventType(string $status): string
    {
        return match ($status) {
            'preparing' => 'item_preparing',
            'ready' => 'item_ready',
            'served' => 'item_served',
            'cancelled' => 'cancelled',
            default => 'order_received',
        };
    }

    private function orderRelations(): array
    {
        return ['items.product:id,category_id', 'branch', 'diningTable'];
    }
}
