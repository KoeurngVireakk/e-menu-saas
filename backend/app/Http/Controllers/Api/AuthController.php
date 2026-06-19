<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => 'shop_owner',
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        return $this->success('Registered successfully', [
            'user' => $user,
            'token' => $user->createToken('admin')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:120'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->isActive()) {
            $this->audit($request, 'login.blocked', null, 'user', $user->id, [
                'status' => $user->status,
                'role' => $user->role,
            ]);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $this->audit($request, 'login', null, 'user', $user->id, [
            'email' => $user->email,
            'role' => $user->role,
        ]);

        return $this->success('Logged in successfully', [
            'user' => $user,
            'token' => $user->createToken($validated['device_name'] ?? 'admin')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $this->audit($request, 'logout', null, 'user', $request->user()->id, [
            'role' => $request->user()->role,
        ]);

        $request->user()->currentAccessToken()?->delete();

        return $this->success('Logged out successfully');
    }

    public function me(Request $request)
    {
        return $this->success('Authenticated user loaded', [
            'user' => $request->user()->load(['shops', 'staffAssignments.shop', 'staffAssignments.branch']),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['super_admin', 'shop_owner', 'manager', 'cashier', 'waiter'])],
        ]);

        abort_unless($request->user()->role === 'super_admin', 403);

        $user->update($validated);

        return $this->success('User role updated', ['user' => $user]);
    }
}
