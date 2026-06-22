<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountActivityLog;
use App\Models\User;
use App\Services\AccountActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function __construct(private readonly AccountActivityService $activity)
    {
    }

    public function profile(Request $request)
    {
        return $this->success('Account profile loaded', [
            'profile' => $this->profilePayload($request->user()),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user = $request->user();
        $user->update($validated);

        $this->audit($request, 'account.profile_updated', null, 'user', $user->id, [
            'changed_keys' => array_keys($validated),
        ]);
        $this->activity->log(
            $request,
            $user,
            'profile_updated',
            'Profile updated',
            'Your personal profile information was updated.',
            ['changed_keys' => array_keys($validated)]
        );

        return $this->success('Profile updated successfully', [
            'profile' => $this->profilePayload($user->refresh()),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['new_password']),
        ])->save();

        $this->audit($request, 'account.password_updated', null, 'user', $user->id);
        $this->activity->log(
            $request,
            $user,
            'password_changed',
            'Password changed',
            'Your account password was changed.'
        );

        return $this->success('Password updated successfully');
    }

    public function preferences(Request $request)
    {
        return $this->success('Account preferences loaded', [
            'preferences' => $this->preferencesPayload($request->user()->preferences_json ?? []),
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'language' => ['nullable', 'string', 'in:en,km'],
            'timezone' => ['nullable', 'string', 'max:80'],
            'date_format' => ['nullable', 'string', 'in:yyyy-mm-dd,dd/mm/yyyy,mmm d, yyyy'],
            'dashboard_default_range' => ['nullable', 'string', 'in:today,7d,30d'],
            'notifications' => ['nullable', 'array'],
            'notifications.orders' => ['nullable', 'boolean'],
            'notifications.payments' => ['nullable', 'boolean'],
            'notifications.system' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $preferences = $this->preferencesPayload($user->preferences_json ?? []);

        $preferences = array_replace_recursive($preferences, $validated);
        $user->forceFill(['preferences_json' => $preferences])->save();

        $this->audit($request, 'account.preferences_updated', null, 'user', $user->id, [
            'changed_keys' => array_keys($validated),
        ]);
        $this->activity->log(
            $request,
            $user,
            'preferences_updated',
            'Preferences updated',
            'Your account preferences were updated.',
            ['changed_keys' => array_keys($validated)]
        );

        return $this->success('Preferences updated successfully', [
            'preferences' => $preferences,
        ]);
    }

    public function activity(Request $request)
    {
        $logs = AccountActivityLog::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($this->paginationLimit($request, 6, 25));

        return $this->success('Account activity loaded', [
            'activity' => $logs->getCollection()->map(fn (AccountActivityLog $log) => [
                'id' => $log->id,
                'type' => $log->type,
                'title' => $log->title,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'metadata' => collect($log->metadata_json ?? [])
                    ->only(['changed_keys', 'role', 'status'])
                    ->all(),
                'created_at' => $log->created_at,
            ])->values(),
            'meta' => $this->paginationMeta($logs),
        ]);
    }

    private function profilePayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'status' => $user->status,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'preferences' => $this->preferencesPayload($user->preferences_json ?? []),
        ];
    }

    private function preferencesPayload(array $preferences): array
    {
        return array_replace_recursive([
            'language' => 'en',
            'timezone' => 'Asia/Phnom_Penh',
            'date_format' => 'yyyy-mm-dd',
            'dashboard_default_range' => 'today',
            'notifications' => [
                'orders' => true,
                'payments' => true,
                'system' => true,
            ],
        ], $preferences);
    }
}
