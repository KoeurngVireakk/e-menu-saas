<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function success(string $message, mixed $data = null, int $status = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }

    protected function error(string $message, mixed $errors = null, int $status = 400): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    protected function authorizeShopAccess(Request $request, Shop $shop, ?int $branchId = null): void
    {
        abort_unless($request->user()?->canAccessShop($shop, $branchId), 403);
    }

    protected function authorizeBranchAccess(Request $request, Branch $branch): void
    {
        $this->authorizeShopAccess($request, $branch->shop, $branch->id);
    }

    protected function accessibleShopIds(Request $request): array
    {
        return $request->user()->accessibleShopIds();
    }

    protected function scopeBranchAccess(
        Request $request,
        $query,
        int $shopId,
        string $column = 'branch_id',
        bool $includeGlobal = false
    ) {
        $branchIds = $request->user()->accessibleBranchIdsForShop($shopId);

        if ($branchIds === null) {
            return $query;
        }

        return $query->where(function (Builder $nested) use ($branchIds, $column, $includeGlobal) {
            if ($includeGlobal) {
                $nested->whereNull($column)->orWhereIn($column, $branchIds);

                return;
            }

            $nested->whereIn($column, $branchIds);
        });
    }
}
