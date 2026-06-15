<?php

use App\Models\Branch;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('restaurant.{restaurantId}', function (User $user, int $restaurantId) {
    return $user->canAccessShop($restaurantId);
});

Broadcast::channel('branch.{branchId}', function (User $user, int $branchId) {
    $branch = Branch::find($branchId);

    return $branch ? $user->canAccessShop($branch->shop_id, $branch->id) : false;
});

Broadcast::channel('table.{tableId}', function (User $user, int $tableId) {
    $table = DiningTable::find($tableId);

    return $table ? $user->canAccessShop($table->shop_id, $table->branch_id) : false;
});

Broadcast::channel('order.{orderId}', function (User $user, int $orderId) {
    $order = Order::find($orderId);

    return $order ? $user->canAccessShop($order->shop_id, $order->branch_id) : false;
});

Broadcast::channel('kitchen.{branchId}', function (User $user, int $branchId) {
    $branch = Branch::find($branchId);

    return $branch && $user->canViewKitchen() && $user->canAccessShop($branch->shop_id, $branch->id);
});

Broadcast::channel('admin.restaurant.{restaurantId}', function (User $user, int $restaurantId) {
    $shop = Shop::find($restaurantId);

    return $shop
        && in_array($user->role, ['super_admin', 'shop_owner', 'manager'], true)
        && $user->canAccessShop($shop->id);
});
