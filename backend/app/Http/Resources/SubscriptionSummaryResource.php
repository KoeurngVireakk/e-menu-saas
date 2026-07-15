<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subscription = $this->resource['subscription'];

        return [
            'shop' => $this->resource['shop'],
            'plan' => (new PlanResource($this->resource['plan']))->resolve($request),
            'subscription' => [
                'status' => $subscription->status,
                'effective_status' => $this->resource['effective_status'],
                'trial_started_at' => $subscription->trial_started_at,
                'trial_ends_at' => $subscription->trial_ends_at,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,
            ],
            'write_access' => $this->resource['write_access'],
            'usage' => $this->resource['usage'],
            'upgrade_contact' => $this->resource['upgrade_contact'],
        ];
    }
}
