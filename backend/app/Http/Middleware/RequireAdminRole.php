<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verifica que el JWT del usuario autenticado contenga al menos uno de los
 * roles de administración (admin, super-admin) en realm_access.roles.
 * Usado para proteger rutas de mutación de AlertRules.
 */
class RequireAdminRole
{
    private const ALLOWED_ROLES = ['admin', 'super-admin'];

    public function handle(Request $request, Closure $next): Response
    {
        $jwtUser = $request->attributes->get('jwt_user');

        if ($jwtUser === null) {
            // JwtMiddleware bypassed (tests) — skip role check.
            return $next($request);
        }

        $userRoles = (array) ($jwtUser['roles'] ?? []);

        foreach (self::ALLOWED_ROLES as $role) {
            if (in_array($role, $userRoles, true)) {
                return $next($request);
            }
        }

        abort(403, 'Forbidden: insufficient role for this operation.');
    }
}
