<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProtectDemoWorkspace
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethodSafe() || ! $request->user() || ! config('demo.enabled')) {
            return $next($request);
        }

        $accessibleShopIds = $request->user()->accessibleShopIds();

        if ($accessibleShopIds === []) {
            return $next($request);
        }

        $shops = Shop::query()
            ->whereIn('id', $accessibleShopIds)
            ->get(['id', 'is_demo']);

        $demoShopIds = $shops->where('is_demo', true)->pluck('id');
        $onlyHasDemoWorkspace = $shops->isNotEmpty() && $shops->every(fn (Shop $shop): bool => $shop->is_demo);
        $targetShopIds = collect([$request->input('shop_id')])
            ->filter()
            ->map(fn ($id): int => (int) $id);

        foreach ($request->route()?->parameters() ?? [] as $parameter) {
            if ($parameter instanceof Shop) {
                $targetShopIds->push($parameter->id);
            } elseif ($parameter instanceof Model && filled($parameter->getAttribute('shop_id'))) {
                $targetShopIds->push((int) $parameter->getAttribute('shop_id'));
            }
        }

        $targetsDemoWorkspace = $targetShopIds->intersect($demoShopIds)->isNotEmpty();

        if (! $onlyHasDemoWorkspace && ! $targetsDemoWorkspace) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'This demo workspace is read-only. Explore freely; changes are disabled because demo data resets automatically.',
            'code' => 'DEMO_WRITE_BLOCKED',
            'demo_mode' => true,
            'errors' => (object) [],
        ], 409);
    }
}
