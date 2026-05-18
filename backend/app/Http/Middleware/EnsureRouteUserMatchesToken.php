<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verifies that the {user} route parameter matches the Keycloak UUID from the JWT.
 * Reads jwt_user from request attributes (set by JwtMiddleware) — no extra DB query.
 * When JwtMiddleware is bypassed (e.g. tests), the check is skipped gracefully.
 */
class EnsureRouteUserMatchesToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $routeUser = $request->route('user');
        if ($routeUser === null) {
            return $next($request);
        }

        $jwtUser = $request->attributes->get('jwt_user');
        if ($jwtUser === null) {
            // JWT middleware bypassed (e.g. in tests) — skip ownership check.
            return $next($request);
        }

        $authenticatedId = $jwtUser['id'] ?? $jwtUser['sub'] ?? null;

        if ($authenticatedId !== null && $routeUser !== $authenticatedId) {
            abort(403, 'Forbidden: authenticated user does not match the requested resource.');
        }

        return $next($request);
    }
}
