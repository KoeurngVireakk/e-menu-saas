<?php

namespace App\Services\Payments;

class PaymentResult
{
    public function __construct(
        public readonly string $status,
        public readonly string $nextAction = 'none',
        public readonly ?string $provider = null,
        public readonly ?string $providerPaymentId = null,
        public readonly ?string $providerReference = null,
        public readonly ?string $qrPayload = null,
        public readonly ?string $qrImageUrl = null,
        public readonly ?string $failureReason = null,
        public readonly ?\DateTimeInterface $expiresAt = null,
    ) {
    }

    public function paymentAttributes(): array
    {
        return [
            'provider' => $this->provider,
            'provider_payment_id' => $this->providerPaymentId,
            'provider_reference' => $this->providerReference,
            'qr_payload' => $this->qrPayload,
            'qr_image_url' => $this->qrImageUrl,
            'status' => $this->status,
            'failure_reason' => $this->failureReason,
            'expires_at' => $this->expiresAt,
        ];
    }

    public function responsePayload(): array
    {
        return [
            'next_action' => $this->nextAction,
            'qr_payload' => $this->qrPayload,
            'qr_image_url' => $this->qrImageUrl,
        ];
    }
}
