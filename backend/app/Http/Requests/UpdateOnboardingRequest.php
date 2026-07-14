<?php

namespace App\Http\Requests;

use App\Services\RestaurantOnboardingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'shop_owner' || $this->user()?->role === 'super_admin';
    }

    public function rules(): array
    {
        return [
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'current_step' => ['nullable', 'string', Rule::in(RestaurantOnboardingService::STEPS)],
            'step' => ['nullable', 'string', Rule::in(RestaurantOnboardingService::STEPS)],
            'completed' => ['required_with:step', 'boolean'],
        ];
    }
}
