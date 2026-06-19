<?php

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Cache;

class PublicMenuCacheService
{
    private const VERSION_PREFIX = 'public_menu:shop_version:';
    private const MENU_PREFIX = 'public_menu:menu:';

    public function menuKey(int $shopId, ?int $branchId, ?string $tableCode, string $locale): string
    {
        return implode(':', [
            self::MENU_PREFIX,
            $shopId,
            $this->version($shopId),
            $branchId ?: 'default-branch',
            $tableCode ?: 'default-table',
            $locale,
        ]);
    }

    public function rememberMenu(string $key, Closure $resolver): array
    {
        $ttl = (int) config('cache.public_menu_ttl_seconds', 60);

        if ($ttl <= 0) {
            return $resolver();
        }

        return Cache::remember($key, now()->addSeconds($ttl), $resolver);
    }

    public function flushShop(int $shopId): void
    {
        Cache::forever($this->versionKey($shopId), $this->version($shopId) + 1);
    }

    private function version(int $shopId): int
    {
        return (int) Cache::get($this->versionKey($shopId), 1);
    }

    private function versionKey(int $shopId): string
    {
        return self::VERSION_PREFIX.$shopId;
    }
}
