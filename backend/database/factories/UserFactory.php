<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factory para User en maya_dashboard.
 *
 * El modelo se federa desde Keycloak vía FDW (Odoo.v_app_users) en
 * producción. En `local`/`testing` se usa una tabla stub con la misma
 * estructura — ver `0001_01_01_000000_create_users_table.php`. La factory
 * inserta sólo columnas que existen en el stub; los campos
 * password/email_verified_at/remember_token del scaffolding Laravel por
 * defecto NO existen (auth es JWT/Keycloak, no Sanctum).
 *
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->name(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'username' => fake()->unique()->userName(),
            'employee_id' => fake()->numerify('EMP####'),
            'dni' => fake()->numerify('########X'),
            'employee_type' => fake()->randomElement(['staff', 'admin', 'guest']),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
