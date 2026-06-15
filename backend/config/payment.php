<?php

return [
    'sandbox_mode' => env('PAYMENT_SANDBOX_MODE', true),

    'bakong_khqr' => [
        'enabled' => env('BAKONG_KHQR_ENABLED', false),
        'merchant_id' => env('BAKONG_KHQR_MERCHANT_ID'),
        'token' => env('BAKONG_KHQR_TOKEN'),
        'api_url' => env('BAKONG_KHQR_API_URL'),
        'webhook_secret' => env('BAKONG_KHQR_WEBHOOK_SECRET'),
    ],
];
