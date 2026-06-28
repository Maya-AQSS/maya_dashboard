<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Http\Request;

abstract class TestCase extends BaseTestCase
{
    /**
     * Injects a fake Keycloak JWT user profile into the next test request.
     * This simulates the attribute that JwtMiddleware writes, without needing a real JWT.
     *
     * Usage:
     *   $this->withJwtUser($user->id)->postJson('/api/v1/alerts/1/acknowledge')
     */
    protected function withJwtUser(string $keycloakUuid): static
    {
        $this->app->resolving(Request::class, function (Request $request) use ($keycloakUuid): void {
            $request->attributes->set('jwt_user', ['id' => $keycloakUuid, 'sub' => $keycloakUuid]);
        });

        return $this;
    }
}
