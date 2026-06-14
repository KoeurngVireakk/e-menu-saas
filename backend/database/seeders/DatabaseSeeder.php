<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::create([
            'name' => 'Demo Owner',
            'email' => 'owner@example.com',
            'phone' => '+85512345678',
            'role' => 'shop_owner',
            'password' => Hash::make('password'),
        ]);

        $manager = User::create([
            'name' => 'Demo Manager',
            'email' => 'manager@example.com',
            'phone' => '+85512345679',
            'role' => 'manager',
            'password' => Hash::make('password'),
        ]);

        $cashier = User::create([
            'name' => 'Demo Cashier',
            'email' => 'cashier@example.com',
            'phone' => '+85512345680',
            'role' => 'cashier',
            'password' => Hash::make('password'),
        ]);

        $waiter = User::create([
            'name' => 'Demo Waiter',
            'email' => 'waiter@example.com',
            'phone' => '+85512345681',
            'role' => 'waiter',
            'password' => Hash::make('password'),
        ]);

        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Rain Drop Cafe',
            'slug' => 'rain-drop-cafe',
            'phone' => '+85512345678',
            'email' => 'hello@raindrop.test',
            'address' => 'Phnom Penh',
            'description' => 'Demo QR menu shop.',
            'primary_color' => '#f97316',
            'secondary_color' => '#111827',
            'currency_code' => 'KHR',
            'status' => 'active',
        ]);

        $branch = $shop->branches()->create([
            'name' => 'Main Branch',
            'phone' => '+85512345678',
            'address' => 'Phnom Penh',
            'opening_time' => '08:00',
            'closing_time' => '22:00',
            'status' => 'active',
        ]);

        $shop->staffAssignments()->create([
            'branch_id' => null,
            'user_id' => $manager->id,
            'role' => 'manager',
            'status' => 'active',
        ]);

        $shop->staffAssignments()->create([
            'branch_id' => $branch->id,
            'user_id' => $cashier->id,
            'role' => 'cashier',
            'status' => 'active',
        ]);

        $shop->staffAssignments()->create([
            'branch_id' => $branch->id,
            'user_id' => $waiter->id,
            'role' => 'waiter',
            'status' => 'active',
        ]);

        $coffee = Category::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'name' => 'Coffee',
            'slug' => 'coffee',
            'sort_order' => 1,
            'status' => 'active',
        ]);

        $food = Category::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'name' => 'Food',
            'slug' => 'food',
            'sort_order' => 2,
            'status' => 'active',
        ]);

        $latte = Product::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'category_id' => $coffee->id,
            'name' => 'Iced Latte',
            'slug' => 'iced-latte',
            'description' => 'Espresso, milk, and ice.',
            'price' => 8000,
            'discount_price' => null,
            'is_featured' => true,
            'is_available' => true,
            'status' => 'active',
        ]);

        $size = $latte->options()->create([
            'name' => 'Size',
            'type' => 'single',
            'is_required' => false,
        ]);

        $size->values()->createMany([
            ['name' => 'Regular', 'extra_price' => 0],
            ['name' => 'Large', 'extra_price' => 2000],
        ]);

        $addons = $latte->options()->create([
            'name' => 'Add-ons',
            'type' => 'multiple',
            'is_required' => false,
        ]);

        $addons->values()->createMany([
            ['name' => 'Extra shot', 'extra_price' => 2500],
            ['name' => 'Oat milk', 'extra_price' => 3000],
        ]);

        Product::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'category_id' => $food->id,
            'name' => 'Chicken Sandwich',
            'slug' => 'chicken-sandwich',
            'description' => 'Grilled chicken, salad, and house sauce.',
            'price' => 14000,
            'discount_price' => null,
            'is_featured' => false,
            'is_available' => true,
            'status' => 'active',
        ]);

        foreach (['T01' => 'Table 01', 'T05' => 'Table 05'] as $code => $name) {
            $branch->diningTables()->create([
            'shop_id' => $shop->id,
            'table_name' => $name,
            'table_code' => $code,
            'qr_token' => Str::random(48),
            'qr_url' => rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')."/menu/{$shop->slug}?branch={$branch->id}&table={$code}",
            'status' => 'active',
            ]);
        }
    }
}
