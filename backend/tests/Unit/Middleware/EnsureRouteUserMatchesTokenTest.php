<?php

use App\Http\Middleware\EnsureRouteUserMatchesToken;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

// ─── no route user parameter ─────────────────────────────────────────────────

it('passes through when route has no {user} parameter', function () {
    $request = Request::create('/api/v1/healthz');
    // No route resolver — route('user') returns null

    $middleware = new EnsureRouteUserMatchesToken;
    $response   = $middleware->handle($request, fn ($req) => response()->json(['ok' => true]));

    expect($response->getStatusCode())->toBe(200);
});

// ─── jwt_user absent (bypassed, e.g. tests) ──────────────────────────────────

it('passes through when jwt_user is null (middleware bypassed)', function () {
    $userId  = 'user-uuid-123';
    $request = Request::create('/api/v1/dashboard/user/' . $userId . '/applications');

    $route = new Route('GET', '/api/v1/dashboard/user/{user}/applications', []);
    $route->bind($request);
    $route->setParameter('user', $userId);
    $request->setRouteResolver(fn () => $route);
    // jwt_user NOT set — simulates test bypass

    $middleware = new EnsureRouteUserMatchesToken;
    $response   = $middleware->handle($request, fn ($req) => response()->json(['ok' => true]));

    expect($response->getStatusCode())->toBe(200);
});

// ─── matching user ────────────────────────────────────────────────────────────

it('passes through when jwt_user id matches the route user', function () {
    $userId  = 'user-uuid-abc';
    $request = Request::create('/api/v1/dashboard/user/' . $userId . '/applications');

    $route = new Route('GET', '/api/v1/dashboard/user/{user}/applications', []);
    $route->bind($request);
    $route->setParameter('user', $userId);
    $request->setRouteResolver(fn () => $route);
    $request->attributes->set('jwt_user', ['id' => $userId, 'sub' => $userId]);

    $middleware = new EnsureRouteUserMatchesToken;
    $response   = $middleware->handle($request, fn ($req) => response()->json(['ok' => true]));

    expect($response->getStatusCode())->toBe(200);
});

it('passes through when jwt_user sub matches the route user', function () {
    $userId  = 'user-uuid-xyz';
    $request = Request::create('/api/v1/dashboard/user/' . $userId . '/applications');

    $route = new Route('GET', '/api/v1/dashboard/user/{user}/applications', []);
    $route->bind($request);
    $route->setParameter('user', $userId);
    $request->setRouteResolver(fn () => $route);
    $request->attributes->set('jwt_user', ['sub' => $userId]);

    $middleware = new EnsureRouteUserMatchesToken;
    $response   = $middleware->handle($request, fn ($req) => response()->json(['ok' => true]));

    expect($response->getStatusCode())->toBe(200);
});

// ─── mismatching user ─────────────────────────────────────────────────────────

it('aborts with 403 when authenticated user does not match the route user', function () {
    $routeUser = 'other-user-id';
    $request   = Request::create('/api/v1/dashboard/user/' . $routeUser . '/applications');

    $route = new Route('GET', '/api/v1/dashboard/user/{user}/applications', []);
    $route->bind($request);
    $route->setParameter('user', $routeUser);
    $request->setRouteResolver(fn () => $route);
    $request->attributes->set('jwt_user', ['id' => 'auth-user-id', 'sub' => 'auth-user-id']);

    $middleware = new EnsureRouteUserMatchesToken;

    expect(fn () => $middleware->handle($request, fn ($req) => response()->json(['ok' => true])))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});
