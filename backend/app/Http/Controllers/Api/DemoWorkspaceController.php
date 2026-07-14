<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;

class DemoWorkspaceController extends Controller
{
    public function show()
    {
        abort_unless(config('demo.enabled'), 404);

        return $this->success('Demo workspace loaded', $this->metadata());
    }

    public function session(Request $request)
    {
        abort_unless(config('demo.enabled'), 404);

        $shop = $this->demoShop();
        $user = $shop->owner;

        abort_unless($user?->isActive(), 503, 'The demo workspace is temporarily unavailable.');

        $this->audit($request, 'demo.session_started', $shop->id, 'shop', $shop->id);

        return $this->success('Demo workspace ready', [
            'user' => $user->load(['shops', 'staffAssignments.shop', 'staffAssignments.branch']),
            'token' => $user->createToken('demo-workspace')->plainTextToken,
            'demo' => $this->metadata($shop),
        ]);
    }

    private function metadata(?Shop $shop = null): array
    {
        $shop ??= $this->demoShop();
        $branch = $shop->branches()->where('status', 'active')->orderBy('id')->firstOrFail();
        $table = $branch->diningTables()->where('status', 'active')->orderBy('id')->first();
        $query = http_build_query(array_filter([
            'branch' => $branch->id,
            'table' => $table?->table_code,
        ]));

        return [
            'is_demo' => true,
            'shop_id' => $shop->id,
            'shop_name' => $shop->name,
            'shop_slug' => $shop->slug,
            'branch_id' => $branch->id,
            'table_code' => $table?->table_code,
            'customer_path' => "/menu/{$shop->slug}".($query ? "?{$query}" : ''),
            'admin_path' => '/admin?tour=1',
            'reset_interval_hours' => (int) config('demo.reset_interval_hours', 24),
            'mode' => 'read_only',
            'checkout_mode' => 'simulated',
        ];
    }

    private function demoShop(): Shop
    {
        return Shop::query()
            ->where('slug', config('demo.slug'))
            ->where('is_demo', true)
            ->where('status', 'active')
            ->with('owner')
            ->firstOrFail();
    }
}
