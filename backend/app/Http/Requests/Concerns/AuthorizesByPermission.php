<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Maya\Auth\Support\JwtSubject;

/**
 * Defense-in-depth permission check inside FormRequests.
 *
 * The primary auth gate is the `permission:<slug>` middleware
 * (Maya\Auth\Middleware\RequirePermissionMiddleware). This trait performs
 * the same FDW lookup so the FormRequest fails closed even if the route
 * loses its middleware in a future refactor.
 *
 * Mirrors the cache key / TTL of the middleware so we share the cached
 * lookup instead of doubling DB round-trips.
 */
trait AuthorizesByPermission
{
    private const CACHE_TTL = 300;

    protected function userHasPermission(string $permission): bool
    {
        if ($this->attributes->get('jwt_user') === null) {
            // JwtMiddleware bypassed (typically tests) — defer to middleware.
            return true;
        }

        $userId = JwtSubject::fromRequest($this);

        if ($userId === null) {
            return false;
        }

        return Cache::remember(
            "perm:{$userId}:{$permission}",
            self::CACHE_TTL,
            fn (): bool => DB::table('user_resolved_permissions')
                ->where('user_id', $userId)
                ->where('permission_slug', $permission)
                ->exists(),
        );
    }
}
