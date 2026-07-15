<?php

return [
    'default_slug' => env('DEFAULT_PLAN_SLUG', 'business'),
    'trial_days' => (int) env('DEFAULT_TRIAL_DAYS', 14),
    'upgrade_contact_email' => env('UPGRADE_CONTACT_EMAIL', 'support@menudigi.app'),
    'definitions' => [
        'starter' => [
            'name' => 'Starter',
            'description' => 'Core QR menu and restaurant ordering tools for one location.',
            'sort_order' => 10,
            'limits' => [
                'branches' => 1,
                'staff_members' => 5,
                'products' => 50,
                'tables' => 20,
                'print_stations' => 1,
            ],
            'features' => [
                'data_export' => false,
                'advanced_reports' => false,
                'multi_branch_operations' => false,
            ],
        ],
        'business' => [
            'name' => 'Business',
            'description' => 'Operational tools, reports, and room to grow across restaurant teams.',
            'sort_order' => 20,
            'limits' => [
                'branches' => 5,
                'staff_members' => 25,
                'products' => 500,
                'tables' => 150,
                'print_stations' => 10,
            ],
            'features' => [
                'data_export' => true,
                'advanced_reports' => true,
                'multi_branch_operations' => true,
            ],
        ],
        'multi-branch' => [
            'name' => 'Multi-Branch',
            'description' => 'Expanded governance for restaurant groups with manually agreed limits.',
            'sort_order' => 30,
            'limits' => [
                'branches' => null,
                'staff_members' => null,
                'products' => null,
                'tables' => null,
                'print_stations' => null,
            ],
            'features' => [
                'data_export' => true,
                'advanced_reports' => true,
                'multi_branch_operations' => true,
            ],
        ],
    ],
];
