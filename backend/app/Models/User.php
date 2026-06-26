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
        'status',
        'preferences_json',
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
            'preferences_json' => 'array',
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

    public function cashDrawerShifts(): HasMany
    {
        return $this->hasMany(CashDrawerShift::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'created_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canManageShops(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner'], true);
    }

    public function canManageCatalog(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canManageBranches(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canManageTables(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canManagePayments(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canManageOrders(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier', 'waiter'], true);
    }

    public function canViewPrintStations(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier', 'waiter'], true);
    }

    public function canManagePrintStations(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canPrintKitchenTicket(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'waiter'], true);
    }

    public function canPrintReceipt(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canViewReports(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canManageDailyClosing(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canExportReports(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canViewShifts(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canOpenShift(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canManageShift(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canCloseShift(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canAddCashMovement(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canViewExpenses(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canManageExpenses(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canApproveExpenses(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canViewCashLedger(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier'], true);
    }

    public function canExportCashLedger(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canViewKitchen(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier', 'waiter'], true);
    }

    public function canManageKitchen(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canUpdateKitchenOrder(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager', 'cashier', 'waiter'], true);
    }

    public function canManageKitchenStations(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canViewStaff(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canManageStaff(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner'], true);
    }

    public function canViewReviews(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canManageReviews(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canViewTenantSettings(): bool
    {
        return in_array($this->role, ['super_admin', 'shop_owner', 'manager'], true);
    }

    public function canManageTenantSettings(): bool
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
