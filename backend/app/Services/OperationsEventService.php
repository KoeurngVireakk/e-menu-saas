<?php

namespace App\Services;

use App\Events\KitchenOrderUpdated;
use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\PaymentConfirmed;
use App\Events\TableActivityUpdated;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Payment;

class OperationsEventService
{
    public function broadcastOrderCreated(Order $order): void
    {
        event(new OrderCreated($order->fresh(['diningTable'])));
        event(new KitchenOrderUpdated($order->fresh(['items', 'diningTable'])));

        if ($order->dining_table_id) {
            event(new TableActivityUpdated($order->diningTable, [
                'type' => 'order_created',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]));
        }
    }

    public function broadcastOrderStatusChanged(Order $order, string $oldStatus): void
    {
        $fresh = $order->fresh(['items', 'diningTable']);

        event(new OrderStatusChanged($fresh, $oldStatus));
        event(new KitchenOrderUpdated($fresh));
    }

    public function broadcastPaymentConfirmed(Payment $payment): void
    {
        event(new PaymentConfirmed($payment->fresh(['order'])));
    }

    public function broadcastTableActivityUpdated(DiningTable $table, array $activity): void
    {
        event(new TableActivityUpdated($table, $activity));
    }

    public function broadcastKitchenOrderUpdated(Order $order): void
    {
        event(new KitchenOrderUpdated($order->fresh(['items', 'diningTable'])));
    }
}
