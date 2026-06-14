<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function shops(): HasMany
    {
        return $this->hasMany(Shop::class, 'owner_id');
    }

    public function staffAssignments(): HasMany
    {
        return $this->hasMany(ShopStaff::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function canManageShops(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner'], true);
    }

    public function accessibleShopIds(): array
    {
        if ($this->isSuperAdmin()) {
            return Shop::pluck('id')->all();
        }

        $owned = $this->shops()->pluck('id')->all();
        $assigned = $this->activeStaffAssignments()->pluck('shop_id')->all();

        return array_values(array_unique([...$owned, ...$assigned]));
    }

    public function accessibleBranchIdsForShop(int $shopId): ?array
    {
        if ($this->isSuperAdmin() || $this->shops()->whereKey($shopId)->exists()) {
            return null;
        }

        $assignments = $this->activeStaffAssignments()
            ->where('shop_id', $shopId)
            ->get(['branch_id']);

        if ($assignments->isEmpty()) {
            return [];
        }

        if ($assignments->contains(fn (ShopStaff $staff) => $staff->branch_id === null)) {
            return null;
        }

        return $assignments->pluck('branch_id')->filter()->unique()->values()->all();
    }

    public function canAccessShop(Shop|int $shop, ?int $branchId = null): bool
    {
        $shopId = $shop instanceof Shop ? $shop->id : $shop;

        if ($this->isSuperAdmin() || $this->shops()->whereKey($shopId)->exists()) {
            return true;
        }

        $branchIds = $this->accessibleBranchIdsForShop($shopId);

        if ($branchIds === null) {
            return $this->activeStaffAssignments()->where('shop_id', $shopId)->exists();
        }

        if ($branchId === null) {
            return ! empty($branchIds);
        }

        return in_array($branchId, $branchIds, true);
    }

    private function activeStaffAssignments(): HasMany
    {
        return $this->staffAssignments()->where('status', 'active');
    }
}
