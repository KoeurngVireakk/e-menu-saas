<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            'errors' => $errors ?? (object) [],
        ];

        return response()->json($payload, $status);
    }

    protected function audit(
        Request $request,
        string $action,
        ?int $shopId = null,
        ?string $entityType = null,
        int|string|null $entityId = null,
        array $metadata = []
    ): void {
        try {
            AuditLog::create([
                'user_id' => $request->user()?->id,
                'shop_id' => $shopId,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId !== null ? (int) $entityId : null,
                'ip_address' => $request->ip(),
                'user_agent' => str($request->userAgent() ?? '')->limit(500, '')->toString(),
                'metadata_json' => $this->safeAuditMetadata($metadata),
                'created_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Audit log write failed', [
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function safeAuditMetadata(array $metadata): array
    {
        $blockedKeys = ['password', 'password_confirmation', 'token', 'authorization', 'proof_image_path', 'proof_file', 'proof'];

        return collect($metadata)
            ->reject(fn ($value, string|int $key) => is_string($key) && in_array(strtolower($key), $blockedKeys, true))
            ->map(function ($value) {
                if (is_string($value)) {
                    return str($value)->limit(500, '')->toString();
                }

                if (is_array($value)) {
                    return $this->safeAuditMetadata($value);
                }

                return $value;
            })
            ->all();
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
        Builder|Relation $query,
        int $shopId,
        string $column = 'branch_id',
        bool $includeGlobal = false
    ): Builder|Relation {
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
