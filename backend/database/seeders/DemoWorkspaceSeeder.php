<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoWorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            Shop::query()->where('is_demo', true)->where('slug', config('demo.slug'))->delete();
            User::query()->whereIn('email', config('demo.user_emails', []))->delete();

            $users = collect([
                'owner' => ['Harbor Demo Owner', config('demo.owner_email'), 'shop_owner'],
                'manager' => ['Harbor Demo Manager', 'demo.manager@menudigi.test', 'manager'],
                'cashier' => ['Harbor Demo Cashier', 'demo.cashier@menudigi.test', 'cashier'],
                'waiter' => ['Harbor Demo Waiter', 'demo.waiter@menudigi.test', 'waiter'],
            ])->mapWithKeys(function (array $profile, string $key): array {
                return [$key => User::create([
                    'name' => $profile[0],
                    'email' => $profile[1],
                    'phone' => null,
                    'role' => $profile[2],
                    'status' => 'active',
                    'password' => Hash::make(str()->random(48)),
                ])];
            });

            $shop = Shop::create([
                'owner_id' => $users['owner']->id,
                'name' => 'Harbor Table Demo',
                'slug' => config('demo.slug'),
                'phone' => null,
                'email' => null,
                'address' => 'Demo riverside district, Phnom Penh',
                'description' => 'A fictional restaurant workspace for exploring MenuDIGI safely.',
                'primary_color' => '#2563EB',
                'secondary_color' => '#0F172A',
                'currency_code' => 'KHR',
                'status' => 'active',
                'is_demo' => true,
            ]);

            $branch = $shop->branches()->create([
                'name' => 'Riverside Demo Branch',
                'phone' => null,
                'address' => 'Demo riverside district, Phnom Penh',
                'opening_time' => '07:00',
                'closing_time' => '22:00',
                'status' => 'active',
            ]);

            foreach (['manager' => null, 'cashier' => $branch->id, 'waiter' => $branch->id] as $role => $branchId) {
                $shop->staffAssignments()->create([
                    'branch_id' => $branchId,
                    'user_id' => $users[$role]->id,
                    'role' => $role,
                    'status' => 'active',
                ]);
            }

            foreach (['T01' => 'Window Table 01', 'T02' => 'Garden Table 02', 'T03' => 'Counter 03'] as $code => $name) {
                $branch->diningTables()->create([
                    'shop_id' => $shop->id,
                    'table_name' => $name,
                    'table_code' => $code,
                    'qr_token' => hash('sha256', "menudigi-demo-{$code}"),
                    'qr_url' => rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')."/menu/{$shop->slug}?branch={$branch->id}&table={$code}",
                    'status' => 'active',
                ]);
            }

            $coffee = $this->category($shop, 'Coffee & tea', 'coffee-tea', 1);
            $meals = $this->category($shop, 'All-day meals', 'all-day-meals', 2);
            $desserts = $this->category($shop, 'Desserts', 'desserts', 3);

            $latte = $this->product($shop, $coffee, 'Iced palm sugar latte', 'iced-palm-sugar-latte', 12000, true, 7);
            $size = $latte->options()->create(['name' => 'Size', 'type' => 'single', 'is_required' => true]);
            $size->values()->createMany([
                ['name' => 'Regular', 'extra_price' => 0],
                ['name' => 'Large', 'extra_price' => 2000],
            ]);
            $milk = $latte->options()->create(['name' => 'Milk choice', 'type' => 'single', 'is_required' => false]);
            $milk->values()->createMany([
                ['name' => 'Fresh milk', 'extra_price' => 0],
                ['name' => 'Oat milk', 'extra_price' => 3000],
            ]);

            $products = collect([
                $latte,
                $this->product($shop, $coffee, 'Jasmine cold brew tea', 'jasmine-cold-brew-tea', 9000, false, 5),
                $this->product($shop, $meals, 'Lemongrass chicken rice', 'lemongrass-chicken-rice', 18000, true, 15),
                $this->product($shop, $meals, 'Garden tofu bowl', 'garden-tofu-bowl', 16000, false, 12),
                $this->product($shop, $desserts, 'Coconut pandan cake', 'coconut-pandan-cake', 10000, true, 4),
            ]);

            $this->seedOrders($shop, $branch, $products);
        });
    }

    private function category(Shop $shop, string $name, string $slug, int $sortOrder): Category
    {
        return $shop->categories()->create([
            'branch_id' => null,
            'name' => $name,
            'slug' => $slug,
            'sort_order' => $sortOrder,
            'status' => 'active',
        ]);
    }

    private function product(Shop $shop, Category $category, string $name, string $slug, int $price, bool $featured, int $minutes): Product
    {
        return $shop->products()->create([
            'branch_id' => null,
            'category_id' => $category->id,
            'name' => $name,
            'slug' => $slug,
            'description' => 'Fictional demo menu item prepared for the MenuDIGI walkthrough.',
            'price' => $price,
            'preparation_time_minutes' => $minutes,
            'is_featured' => $featured,
            'is_available' => true,
            'status' => 'active',
        ]);
    }

    private function seedOrders(Shop $shop, $branch, $products): void
    {
        $states = [
            ['DEMO-1001', 'pending', 'unpaid', 'pending', null, 1],
            ['DEMO-1002', 'accepted', 'pending', 'preparing', 'khqr_manual', 2],
            ['DEMO-1003', 'preparing', 'paid', 'preparing', 'cash', 1],
            ['DEMO-1004', 'ready', 'paid', 'prepared', 'bakong_khqr', 2],
            ['DEMO-1005', 'completed', 'paid', 'served', 'cash', 3],
        ];

        foreach ($states as $index => [$number, $orderStatus, $paymentStatus, $kitchenStatus, $method, $quantity]) {
            $product = $products[$index % $products->count()];
            $subtotal = (float) $product->price * $quantity;
            $order = Order::create([
                'order_number' => $number,
                'shop_id' => $shop->id,
                'branch_id' => $branch->id,
                'dining_table_id' => $branch->diningTables()->orderBy('id')->value('id'),
                'customer_name' => 'Demo Guest '.($index + 1),
                'customer_phone' => null,
                'order_type' => 'dine_in',
                'subtotal' => $subtotal,
                'discount_total' => 0,
                'service_charge' => 0,
                'tax_total' => 0,
                'grand_total' => $subtotal,
                'currency_code' => 'KHR',
                'payment_status' => $paymentStatus,
                'order_status' => $orderStatus,
                'note' => $index === 1 ? 'Demo request: less ice' : null,
            ]);

            $item = $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'total_price' => $subtotal,
                'selected_options_json' => [],
                'kitchen_status' => $kitchenStatus,
                'prepared_at' => in_array($kitchenStatus, ['prepared', 'served'], true) ? now()->subMinutes(8) : null,
                'served_at' => $kitchenStatus === 'served' ? now()->subMinutes(3) : null,
            ]);

            if ($method) {
                Payment::create([
                    'order_id' => $order->id,
                    'shop_id' => $shop->id,
                    'branch_id' => $branch->id,
                    'payment_method' => $method,
                    'provider' => $method === 'bakong_khqr' ? 'demo' : 'manual',
                    'amount' => $subtotal,
                    'currency_code' => 'KHR',
                    'proof_image_path' => null,
                    'status' => $paymentStatus === 'paid' ? 'paid' : 'pending',
                    'confirmed_at' => $paymentStatus === 'paid' ? now()->subMinutes(5) : null,
                ]);
            }

            if ($orderStatus === 'completed') {
                $order->review()->create([
                    'shop_id' => $shop->id,
                    'branch_id' => $branch->id,
                    'rating' => 5,
                    'comment' => 'A fictional review for the demo workspace.',
                    'status' => 'visible',
                ]);
            }

            $order->kitchenEvents()->create([
                'shop_id' => $shop->id,
                'branch_id' => $branch->id,
                'order_item_id' => $item->id,
                'event_type' => "item_{$kitchenStatus}",
                'metadata_json' => ['source' => 'demo_seed'],
            ]);
        }
    }
}
