<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\ShopStaff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ShopStaffController extends Controller
{
    public function index(Request $request, Shop $shop)
    {
        $this->authorizeStaffView($request, $shop, null, false);

        $query = $shop->staffAssignments()
            ->with(['user:id,name,email,phone,role', 'branch:id,name'])
            ->latest();

        $branchIds = $request->user()->accessibleBranchIdsForShop($shop->id);
        if ($branchIds !== null) {
            $query->whereIn('branch_id', $branchIds);
        }

        return $this->success('Staff loaded', [
            'staff' => $query->get(),
        ]);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorizeStaffManagement($request, $shop);

        $validated = $this->validateStaff($request, $shop);
        $user = User::where('email', $validated['email'])->first();
        $temporaryPassword = null;

        if ($user) {
            abort_if(in_array($user->role, ['super_admin', 'shop_owner'], true), 422, 'This user cannot be assigned as shop staff.');
            $user->update([
                'name' => $validated['name'] ?? $user->name,
                'phone' => $validated['phone'] ?? $user->phone,
                'role' => $validated['role'],
            ]);
        } else {
            abort_unless(filled($validated['name'] ?? null), 422, 'Name is required when creating a new staff user.');
            $temporaryPassword = $this->temporaryPassword();
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'role' => $validated['role'],
                'password' => Hash::make($temporaryPassword),
            ]);
        }

        $staff = ShopStaff::updateOrCreate(
            [
                'shop_id' => $shop->id,
                'user_id' => $user->id,
            ],
            [
                'branch_id' => $validated['branch_id'] ?? null,
                'role' => $validated['role'],
                'status' => $validated['status'] ?? 'active',
            ]
        );

        $this->audit($request, 'staff.added', $shop->id, 'shop_staff', $staff->id, [
            'staff_user_id' => $user->id,
            'role' => $staff->role,
            'branch_id' => $staff->branch_id,
            'status' => $staff->status,
        ]);

        $payload = ['staff' => $staff->fresh()->load(['user:id,name,email,phone,role', 'branch:id,name'])];
        if ($temporaryPassword) {
            $payload['temporary_password'] = $temporaryPassword;
        }

        return $this->success('Staff saved successfully', $payload, 201);
    }

    public function show(Request $request, ShopStaff $staff)
    {
        $this->authorizeStaffView($request, $staff->shop, $staff->branch_id);

        return $this->success('Staff loaded', [
            'staff' => $staff->load(['user:id,name,email,phone,role', 'branch:id,name', 'shop:id,name']),
        ]);
    }

    public function update(Request $request, ShopStaff $staff)
    {
        $this->authorizeStaffManagement($request, $staff->shop);

        $validated = $this->validateStaffUpdate($request, $staff->shop);
        $staff->update($validated);
        $staff->user()->update(['role' => $staff->role]);

        $this->audit($request, 'staff.updated', $staff->shop_id, 'shop_staff', $staff->id, [
            'staff_user_id' => $staff->user_id,
            'role' => $staff->role,
            'branch_id' => $staff->branch_id,
            'status' => $staff->status,
        ]);

        return $this->success('Staff updated successfully', [
            'staff' => $staff->fresh()->load(['user:id,name,email,phone,role', 'branch:id,name']),
        ]);
    }

    public function updateStatus(Request $request, ShopStaff $staff)
    {
        $this->authorizeStaffManagement($request, $staff->shop);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $staff->update($validated);

        $this->audit($request, $staff->status === 'inactive' ? 'staff.disabled' : 'staff.updated', $staff->shop_id, 'shop_staff', $staff->id, [
            'staff_user_id' => $staff->user_id,
            'status' => $staff->status,
        ]);

        return $this->success('Staff status updated', [
            'staff' => $staff->fresh()->load(['user:id,name,email,phone,role', 'branch:id,name']),
        ]);
    }

    public function destroy(Request $request, ShopStaff $staff)
    {
        $this->authorizeStaffManagement($request, $staff->shop);

        $staffId = $staff->id;
        $shopId = $staff->shop_id;
        $userId = $staff->user_id;
        $staff->delete();

        $this->audit($request, 'staff.deleted', $shopId, 'shop_staff', $staffId, [
            'staff_user_id' => $userId,
        ]);

        return $this->success('Staff removed successfully');
    }

    private function validateStaff(Request $request, Shop $shop): array
    {
        return $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'branch_id' => ['nullable', Rule::exists('branches', 'id')->where('shop_id', $shop->id)],
            'role' => ['required', Rule::in(['manager', 'cashier', 'waiter'])],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function validateStaffUpdate(Request $request, Shop $shop): array
    {
        return $request->validate([
            'branch_id' => ['nullable', Rule::exists('branches', 'id')->where('shop_id', $shop->id)],
            'role' => ['required', Rule::in(['manager', 'cashier', 'waiter'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function authorizeStaffView(Request $request, Shop $shop, ?int $branchId = null, bool $strictBranch = true): void
    {
        $this->authorizeShopAccess($request, $shop, $branchId);
        abort_unless($request->user()->canViewStaff(), 403);

        $branchIds = $request->user()->accessibleBranchIdsForShop($shop->id);
        abort_if($strictBranch && $branchIds !== null && ($branchId === null || ! in_array($branchId, $branchIds, true)), 403);
    }

    private function authorizeStaffManagement(Request $request, Shop $shop): void
    {
        $this->authorizeShopAccess($request, $shop);
        abort_unless($request->user()->canManageStaff(), 403);
    }

    private function temporaryPassword(): string
    {
        return Str::random(10).'Aa1!';
    }
}
