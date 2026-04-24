<?php

namespace App\Http\Controllers\Concerns;

use App\Models\User;
use Illuminate\Http\Request;

trait ResolvesKeycloakUser
{
    /**
     * Resolve (or auto-provision) the Eloquent User matching the JWT's `sub` claim.
     * The JwtMiddleware stores the claims under the `jwt_user` request attribute.
     */
    protected function resolveKeycloakUser(Request $request): User
    {
        $jwtUser = $request->attributes->get('jwt_user');
        $keycloakId = $jwtUser['id'] ?? null;

        abort_if($keycloakId === null, 401, 'Unauthenticated');

        return User::firstOrCreate(
            ['keycloak_id' => $keycloakId],
            [
                'name'     => $jwtUser['name']  ?? $jwtUser['username'] ?? 'Unknown',
                'email'    => $jwtUser['email'] ?? "{$keycloakId}@keycloak.local",
                'password' => '',
            ],
        );
    }
}
