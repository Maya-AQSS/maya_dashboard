<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Other Maya apps need to reach the dashboard backend for shared features
    // (favorites sidebar, notifications, alerts). Keycloak issues the tokens,
    // so any of these origins is authenticated by the same IdP.
    'allowed_origins' => [
        'http://maya_dashboard.localhost',
        'http://maya_authorization.localhost',
        'http://maya_dms.localhost',
        'http://maya_logs.localhost',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
