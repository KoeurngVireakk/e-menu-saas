<?php

$allowedOrigins = array_values(array_unique(array_filter(array_map(
    fn (string $origin) => trim($origin),
    explode(',', implode(',', [
        env('FRONTEND_URL', 'http://localhost:5173'),
        env('FRONTEND_ADMIN_URL', ''),
        env('FRONTEND_PUBLIC_URL', ''),
        'http://127.0.0.1:5173',
    ]))
), fn (string $origin) => $origin !== '' && $origin !== '*')));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
