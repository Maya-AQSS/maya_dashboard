<?php

/*
 * Orígenes que pueden abrir el WebSocket (cabecera Origin; Reverb compara solo el host, con
 * comodines `*` de Str::is). La barra lateral de las 5 apps escucha este Reverb (D37), así que
 * se admiten las mismas SPAs que en CORS (config/cors.php): cualquier subdominio de
 * CORS_REGEX_DOMAIN (`*.ceedcv` en producción; en desarrollo, el dominio que pone
 * gen-values.py), localhost (y `*.localhost`) y los hosts de CORS_ADDITIONAL_ORIGINS.
 * REVERB_ALLOWED_ORIGINS (lista separada por comas, p. ej. `*.ceedcv,localhost`; `*` = todos)
 * sustituye a esa lista.
 */
$reverbAllowedOrigins = (static function (): array {
    $split = static fn (string $list): array => array_values(array_filter(array_map('trim', explode(',', $list))));

    $explicit = $split((string) env('REVERB_ALLOWED_ORIGINS', ''));
    if ($explicit !== []) {
        return $explicit;
    }

    $hosts = ['*.'.env('CORS_REGEX_DOMAIN', 'localhost'), 'localhost', '*.localhost'];
    foreach ($split((string) env('CORS_ADDITIONAL_ORIGINS', '')) as $origin) {
        $host = parse_url($origin, PHP_URL_HOST);
        if (is_string($host) && $host !== '') {
            $hosts[] = $host;
        }
    }

    return array_values(array_unique($hosts));
})();

return [

    /*
    |--------------------------------------------------------------------------
    | Default Reverb Server
    |--------------------------------------------------------------------------
    |
    | This option controls the default Reverb server that will be used when
    | starting the Reverb server via the "reverb:start" Artisan command.
    | The selected server should be defined in the "servers" array below.
    |
    */

    'default' => 'reverb',

    /*
    |--------------------------------------------------------------------------
    | Reverb Servers
    |--------------------------------------------------------------------------
    |
    | Here you may define all the Reverb server configurations that can be used
    | by the Reverb server process. Internally, Reverb makes use of these
    | settings to configure and start your WebSocket server and determine
    | how incoming requests should be handled.
    |
    */

    'servers' => [

        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => env('REVERB_SERVER_PORT', 8080),
            'hostname' => env('REVERB_HOST'),
            'options' => [
                'tls' => [],
            ],
            'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 10_000),
            'scaling' => [
                'enabled' => env('REVERB_SCALING_ENABLED', false),
                'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
                'server' => [
                    'url' => env('REDIS_URL'),
                    'host' => env('REDIS_HOST', '127.0.0.1'),
                    'port' => env('REDIS_PORT', '6379'),
                    'database' => env('REDIS_DB', '0'),
                ],
            ],
            'pulse_ingest_interval' => env('REVERB_PULSE_INGEST_INTERVAL', 15),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Reverb Applications
    |--------------------------------------------------------------------------
    |
    | A Reverb server may host multiple applications. Here you may define
    | each application that should be available via this Reverb server.
    | Each application should have a unique "key" and "app_id" value.
    |
    */

    'apps' => [

        'provider' => 'config',

        'apps' => [
            [
                'key' => env('REVERB_APP_KEY'),
                'secret' => env('REVERB_APP_SECRET'),
                'app_id' => env('REVERB_APP_ID'),
                'options' => [
                    'host' => env('REVERB_HOST', 'localhost'),
                    'port' => env('REVERB_PORT', 8080),
                    'scheme' => env('REVERB_SCHEME', 'http'),
                    'useTLS' => env('REVERB_SCHEME', 'http') === 'https',
                ],
                'allowed_origins' => $reverbAllowedOrigins,
                'ping_interval' => env('REVERB_APP_PING_INTERVAL', 60),
                'pong_timeout' => env('REVERB_APP_PONG_TIMEOUT', 10),
                'max_message_size' => env('REVERB_APP_MAX_MESSAGE_SIZE', 10_000),
            ],
        ],

    ],

];
