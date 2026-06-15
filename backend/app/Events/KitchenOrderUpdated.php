<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KitchenOrderUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('kitchen.'.$this->order->branch_id),
            new PrivateChannel('branch.'.$this->order->branch_id),
            new PrivateChannel('order.'.$this->order->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'kitchen.order_updated';
    }

    public function broadcastWith(): array
    {
        $order = $this->order->loadMissing(['items:id,order_id,product_name,quantity,kitchen_status', 'diningTable:id,table_name']);

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'restaurant_id' => $order->shop_id,
            'branch_id' => $order->branch_id,
            'table_id' => $order->dining_table_id,
            'table_name' => $order->diningTable?->table_name,
            'order_status' => $order->order_status,
            'payment_status' => $order->payment_status,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'kitchen_status' => $item->kitchen_status,
            ])->values()->all(),
            'updated_at' => now()->toISOString(),
        ];
    }
}
