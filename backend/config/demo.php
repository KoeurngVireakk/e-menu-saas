<?php

return [
    'enabled' => env('DEMO_WORKSPACE_ENABLED', true),
    'reset_enabled' => env('DEMO_RESET_ENABLED', false),
    'slug' => env('DEMO_SHOP_SLUG', 'harbor-table-demo'),
    'owner_email' => env('DEMO_OWNER_EMAIL', 'demo.owner@menudigi.test'),
    'user_emails' => [
        env('DEMO_OWNER_EMAIL', 'demo.owner@menudigi.test'),
        'demo.manager@menudigi.test',
        'demo.cashier@menudigi.test',
        'demo.waiter@menudigi.test',
    ],
    'reset_interval_hours' => 24,
];
