<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'shop' => $this->resource['shop'],
            'current_step' => $this->resource['current_step'],
            'next_step' => $this->resource['next_step'],
            'completed_steps' => $this->resource['completed_steps'],
            'completed_count' => $this->resource['completed_count'],
            'total_steps' => $this->resource['total_steps'],
            'progress_percent' => $this->resource['progress_percent'],
            'is_complete' => $this->resource['is_complete'],
            'is_dismissed' => $this->resource['is_dismissed'],
            'completed_at' => $this->resource['completed_at'],
            'last_resumed_at' => $this->resource['last_resumed_at'],
            'steps' => $this->resource['steps'],
            'preview_path' => $this->resource['preview_path'],
            'qr_action_path' => $this->resource['qr_action_path'],
        ];
    }
}
