<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    | Odoo (D21): a Odoo solo se escribe por sus endpoints, nunca por FDW. Los fichajes se registran con
    | POST /api/v1/attendance/clock de maya_attendance, con la clave de API del usuario técnico de
    | fichajes (Vault). La lectura de fichajes sigue por FDW (vista `attendances`).
    | En producción, ODOO_URL = http://odoo-maya-app.maya-erp.svc.cluster.local:8069.
    */
    'odoo' => [
        'url' => env('ODOO_URL'),
        'attendance_api_key' => env('ODOO_ATTENDANCE_API_KEY'),
        // terminal_id de los fichajes del dashboard en Odoo, si la petición no trae `source`
        'attendance_terminal_id' => env('ODOO_ATTENDANCE_TERMINAL_ID', 'dashboard'),
        'timeout' => (float) env('ODOO_TIMEOUT', 5),
    ],

];
