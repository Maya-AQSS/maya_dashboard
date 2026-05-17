<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AlertRule;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AlertRule>
 */
class AlertRuleFactory extends Factory
{
    protected $model = AlertRule::class;

    public function definition(): array
    {
        $suffix = Str::random(6);

        return [
            'slug'             => 'rule-' . $suffix,
            'name'             => 'Rule ' . $suffix,
            'description'      => fake()->optional()->sentence(),
            'query_sql'        => 'SELECT count(*) FROM alerts WHERE severity = \'critical\'',
            'severity'         => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'schedule_cron'    => '*/5 * * * *',
            'enabled'          => true,
            'context_template' => [],
            'last_evaluated_at' => null,
        ];
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'enabled' => false,
        ]);
    }
}
