<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PanelAlert;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PanelAlert>
 */
class PanelAlertFactory extends Factory
{
    protected $model = PanelAlert::class;

    public function definition(): array
    {
        return [
            'text' => fake()->sentence(),
            'severity' => fake()->randomElement(['critical', 'high', 'medium', 'low']),
            'action_label' => fake()->optional()->words(2, true),
            'action_url' => fake()->optional()->url(),
            'visible_from' => now()->subHour(),
            'visible_until' => fake()->optional()->dateTimeBetween('+1 hour', '+7 days'),
            'source' => 'manual',
            'rule_id' => null,
            'created_by' => (string) Str::uuid(),
            'notify_all' => true,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible_from' => now()->subDay(),
            'visible_until' => now()->subHour(),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible_from' => now()->subHour(),
            'visible_until' => now()->addDay(),
        ]);
    }
}
