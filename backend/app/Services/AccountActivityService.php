<?php

namespace App\Services;

use App\Models\AccountActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AccountActivityService
{
    public function log(
        ?Request $request,
        User $user,
        string $type,
        string $title,
        ?string $description = null,
        array $metadata = [],
    ): void {
        try {
            AccountActivityLog::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'description' => $description,
                'ip_address' => $request?->ip(),
                'user_agent' => str($request?->userAgent() ?? '')->limit(500, '')->toString() ?: null,
                'metadata_json' => $this->safeMetadata($metadata),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Account activity log write failed', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function safeMetadata(array $metadata): array
    {
        $blockedKeys = [
            'password',
            'current_password',
            'new_password',
            'new_password_confirmation',
            'password_confirmation',
            'token',
            'authorization',
            'remember_token',
            'proof_image_path',
            'proof_file',
            'proof',
            'provider_response',
            'raw_payload',
            'secret',
            'api_key',
        ];

        return collect($metadata)
            ->reject(fn ($value, string|int $key) => is_string($key) && in_array(strtolower($key), $blockedKeys, true))
            ->map(function ($value) {
                if (is_string($value)) {
                    return str($value)->limit(500, '')->toString();
                }

                if (is_array($value)) {
                    return $this->safeMetadata($value);
                }

                return $value;
            })
            ->all();
    }
}
