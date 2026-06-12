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

        $category = Category::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'name' => 'Coffee',
            'slug' => 'coffee',
            'sort_order' => 1,
            'status' => 'active',
        ]);

        Product::create([
            'shop_id' => $shop->id,
            'branch_id' => null,
            'category_id' => $category->id,
            'name' => 'Iced Latte',
            'slug' => 'iced-latte',
            'description' => 'Espresso, milk, and ice.',
            'price' => 8000,
            'discount_price' => null,
            'is_featured' => true,
            'is_available' => true,
            'status' => 'active',
        ]);

        $branch->diningTables()->create([
            'shop_id' => $shop->id,
            'table_name' => 'Table 05',
            'table_code' => 'T05',
            'qr_token' => Str::random(48),
            'qr_url' => rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')."/menu/{$shop->slug}?branch={$branch->id}&table=T05",
            'status' => 'active',
        ]);
    }
}
