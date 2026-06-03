<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PanelAlertRule;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PanelAlertRule>
 */
class PanelAlertRuleFactory extends Factory
{
    protected $model = PanelAlertRule::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'event_type' => fake()->randomElement(['manual', 'user.login', 'fichaje.missing']),
            'conditions' => null,
            'alert_text' => fake()->sentence(),
            'severity' => fake()->randomElement(['critical', 'high', 'medium', 'low']),
            'action_label' => fake()->optional()->words(2, true),
            'action_url' => fake()->optional()->url(),
            'visible_duration_hours' => fake()->optional()->numberBetween(1, 72),
            'max_frequency_minutes' => 60,
            'is_active' => true,
            'last_triggered_at' => null,
            'created_by' => (string) Str::uuid(),
            'notify_all' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
