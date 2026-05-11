<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verifica que el usuario autenticado tiene un permiso concreto en maya-dashboard.
 *
 * Los permisos se resuelven desde v_dashboard_user_permissions (FDW a maya_auth),
 * que aplica la jerarquía de roles y los overrides grant/deny. El resultado se
 * cachea en Redis durante 5 minutos para evitar queries repetidas por request.
 *
 * Uso en rutas: ->middleware('permission:alerts.manage')
 */
class RequirePermission
{
    private const CACHE_TTL = 300;

    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $jwtUser = $request->attributes->get('jwt_user');

        if ($jwtUser === null) {
            // JwtMiddleware bypassed (tests) — skip permission check.
            return $next($request);
        }

        $userId   = (string) ($jwtUser['id'] ?? '');
        $cacheKey = "perm:{$userId}:{$permission}";

        $has = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($userId, $permission) {
            return DB::table('user_resolved_permissions')
                ->where('user_id', $userId)
                ->where('permission_slug', $permission)
                ->exists();
        });

        if (! $has) {
            abort(403, "Forbidden: missing permission '{$permission}'.");
        }

        return $next($request);
    }
}
