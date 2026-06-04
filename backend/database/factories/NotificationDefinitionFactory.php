<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\NotificationDefinition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationDefinition>
 */
class NotificationDefinitionFactory extends Factory
{
    protected $model = NotificationDefinition::class;

    public function definition(): array
    {
        $key = fake()->unique()->slug(2).'.'.fake()->word();

        return [
            'key' => $key,
            'source_app' => fake()->randomElement(['maya-dms', 'maya-authorization', 'maya-logs', 'dashboard']),
            'category' => 'event',
            'label' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'enabled' => true,
            'default_severity' => fake()->randomElement(['critical', 'high', 'medium', 'low', 'info']),
            'title_key' => 'notifications.'.$key.'.title',
            'body_key' => 'notifications.'.$key.'.body',
            'url_template' => null,
            'schedule_cron' => null,
            'last_evaluated_at' => null,
            'audience' => null,
        ];
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => ['enabled' => false]);
    }

    public function scheduled(string $cron = '0 7 * * *'): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'scheduled',
            'schedule_cron' => $cron,
        ]);
    }
}
