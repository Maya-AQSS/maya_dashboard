<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'message_id' => (string) Str::uuid(),
            'app' => fake()->randomElement(['maya-dms', 'maya-authorization', 'maya-logs']),
            'type' => fake()->slug(2).'.'.fake()->word(),
            'recipient_id' => (string) Str::uuid(),
            'title' => fake()->sentence(4),
            'body' => fake()->paragraph(),
            'title_key' => null,
            'body_key' => null,
            'params' => null,
            'severity' => fake()->randomElement(['critical', 'high', 'medium', 'low', 'info']),
            'url' => fake()->optional()->url(),
            'scope' => 'user',
            'channels' => ['app'],
            'metadata' => null,
            'read_at' => null,
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => ['read_at' => null]);
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => ['read_at' => now()]);
    }

    public function dashboardScope(): static
    {
        return $this->state(fn (array $attributes) => [
            'scope' => 'dashboard',
            'recipient_id' => null,
        ]);
    }

    public function fromKeys(string $key): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => $key,
            'title' => null,
            'body' => null,
            'title_key' => 'notifications.'.$key.'.title',
            'body_key' => 'notifications.'.$key.'.body',
        ]);
    }
}
