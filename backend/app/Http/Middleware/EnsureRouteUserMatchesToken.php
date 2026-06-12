<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maya\Auth\Support\JwtSubject;
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

        if ($request->attributes->get('jwt_user') === null) {
            if (! app()->environment('testing')) {
                Log::warning('EnsureRouteUserMatchesToken: jwt_user is null', ['route' => $request->path()]);
            }

            // JWT middleware bypassed (e.g. in tests) — skip ownership check.
            return $next($request);
        }

        // `id` (claim normalizado por JwtMiddleware) con fallback a `sub` crudo.
        $authenticatedId = JwtSubject::fromRequest($request)
            ?? (JwtSubject::claims($request)['sub'] ?? null);

        if ($authenticatedId !== null && $routeUser !== $authenticatedId) {
            abort(403, 'Forbidden: authenticated user does not match the requested resource.');
        }

        return $next($request);
    }
}
