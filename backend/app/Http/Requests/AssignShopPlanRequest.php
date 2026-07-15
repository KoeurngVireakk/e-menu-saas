<?php

namespace App\Http\Requests;

use App\Services\PlanEntitlementService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignShopPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() === true;
    }

    public function rules(): array
    {
        return [
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'status' => ['required', Rule::in(PlanEntitlementService::STATUSES)],
            'trial_days' => ['nullable', 'integer', 'min:1', 'max:365', 'required_if:status,trialing'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
