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

    /**
     * Evalúa config/<name>.php con las variables de entorno dadas y las restaura después: los
     * ficheros de configuración se cargan al arrancar, con el entorno de las pruebas.
     *
     * @param  array<string, string>  $env
     * @return array<string, mixed>
     */
    protected function configWithEnv(string $name, array $env): array
    {
        $previous = [];
        foreach ($env as $key => $value) {
            $previous[$key] = [$_SERVER[$key] ?? null, $_ENV[$key] ?? null];
            $_SERVER[$key] = $_ENV[$key] = $value;
        }

        try {
            return require config_path("{$name}.php");
        } finally {
            foreach ($previous as $key => [$server, $envConst]) {
                if ($server === null) {
                    unset($_SERVER[$key]);
                } else {
                    $_SERVER[$key] = $server;
                }
                if ($envConst === null) {
                    unset($_ENV[$key]);
                } else {
                    $_ENV[$key] = $envConst;
                }
            }
        }
    }
}
