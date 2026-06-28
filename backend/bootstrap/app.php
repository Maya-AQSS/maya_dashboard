<?php

declare(strict_types=1);

use App\Http\Middleware\EnsureRouteUserMatchesToken;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Maya\Auth\Middleware\JwtMiddleware;
use Maya\Auth\Middleware\RequirePermissionMiddleware;
use Maya\Auth\Middleware\RequireRoleMiddleware;
use Maya\Http\Exceptions\JsonExceptionRenderer;
use Maya\Http\Support\CommonMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Config común Maya (CORS prepend) + aliases propios de dashboard.
        // `trustProxies => false`: dashboard no confiaba en proxies antes de la
        // unificación; se preserva el comportamiento actual.
        CommonMiddleware::register($middleware, [
            'auth.keycloak' => JwtMiddleware::class,
            'user.owns.resource' => EnsureRouteUserMatchesToken::class,
            'permission' => RequirePermissionMiddleware::class,
            'role' => RequireRoleMiddleware::class,
        ], [
            'trustProxies' => false,
            'apiPrepend' => [
                \App\Http\Middleware\SetLocaleFromAcceptLanguage::class,
            ],
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render JSON uniforme para rutas api/* (shared-http-laravel).
        // CAMBIO FUNCIONAL respecto al render por defecto de Laravel — ver changes.md.
        JsonExceptionRenderer::register($exceptions);
    })->create();
