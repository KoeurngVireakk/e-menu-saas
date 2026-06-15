<?php

return [
    'enabled' => env('TELEGRAM_ENABLED', false),
    'sandbox_mode' => env('TELEGRAM_SANDBOX_MODE', true),
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'api_url' => env('TELEGRAM_API_URL', 'https://api.telegram.org'),
];
