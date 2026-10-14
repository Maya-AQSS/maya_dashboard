<?php

declare(strict_types=1);

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Maya\Auth\Middleware\JwtMiddleware;
use Tests\TestCase;

/*
 * D37: la barra lateral de las 5 apps escucha el Reverb del dashboard y autoriza su canal de
 * notificaciones en dashboard-api con el token de su SPA (audiencia maya-dashboard).
 * JwtMiddleware (firma, emisor, audiencia) se prueba en shared-auth-laravel: aquí se sustituye
 * por el perfil que deja en `jwt_user`.
 */

beforeEach(function () {
    // Broadcaster real (el de Reverb, protocolo Pusher) para que se apliquen las reglas de
    // routes/channels.php: phpunit.xml usa el broadcaster null, que no comprueba nada.
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => 'test-app',
    ]);
    Broadcast::forgetDrivers();
    require base_path('routes/channels.php');

    // CORS de producción (CORS_REGEX_DOMAIN=ceedcv).
    config(['cors' => $this->configWithEnv('cors', ['CORS_REGEX_DOMAIN' => 'ceedcv', 'CORS_ADDITIONAL_ORIGINS' => ''])]);

    $this->withoutMiddleware(JwtMiddleware::class);

    $this->tokenSub = null;
    $this->app['events']->listen(RouteMatched::class, function (RouteMatched $event): void {
        if ($this->tokenSub !== null) {
            $event->request->attributes->set('jwt_user', ['id' => $this->tokenSub, 'email' => 'docente@ceedcv.es']);
        }
    });

    $this->queries = 0;
    $this->app['events']->listen(QueryExecuted::class, function (): void {
        $this->queries++;
    });
});

/** Petición de autorización de la SPA de dms (otra app) al endpoint de dashboard-api. */
function authorizeNotificationChannel(TestCase $test, string $channel): TestResponse
{
    return $test->withHeaders(['Origin' => 'https://dms.ceedcv'])->postJson('/api/v1/broadcasting/auth', [
        'socket_id' => '1234.5678',
        'channel_name' => $channel,
    ]);
}

it('authorizes the notifications channel of the token subject, without looking the user up', function () {
    $this->tokenSub = (string) Str::uuid();

    $response = authorizeNotificationChannel($this, "private-notifications.{$this->tokenSub}");

    $response->assertOk();
    expect($response->json('auth'))->toStartWith('test-key:');
    // Solo el `sub` del token: ni la vista FDW `users` ni ninguna otra consulta.
    expect($this->queries)->toBe(0);
});

it('lets the other SPAs call the authorization endpoint (CORS)', function () {
    $this->tokenSub = (string) Str::uuid();

    authorizeNotificationChannel($this, "private-notifications.{$this->tokenSub}")
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'https://dms.ceedcv');
});

it('rejects the notifications channel of another user', function () {
    $this->tokenSub = (string) Str::uuid();

    authorizeNotificationChannel($this, 'private-notifications.'.Str::uuid())->assertForbidden();
});

it('rejects the channel without an authenticated token subject', function () {
    authorizeNotificationChannel($this, 'private-notifications.'.Str::uuid())->assertForbidden();
});

it('authorizes the shared dashboard channel to any token subject', function () {
    $this->tokenSub = (string) Str::uuid();

    authorizeNotificationChannel($this, 'private-notifications.dashboard')->assertOk();
});
