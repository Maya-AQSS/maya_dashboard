<?php

declare(strict_types=1);

namespace Database\Factories;

use App\DTOs\AlertAudienceDto;
use App\Models\NotificationRule;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<NotificationRule>
 */
class NotificationRuleFactory extends Factory
{
    protected $model = NotificationRule::class;

    public function definition(): array
    {
        return [
            'evaluator_key' => 'dms.pending_validations_threshold',
            'source_app' => 'maya-dms',
            'name' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'params' => ['threshold' => 10],
            'schedule_cron' => '0 7 * * *',
            'audience' => AlertAudienceDto::allRecipients(),
            'severity' => null,
            'enabled' => true,
            'created_by' => (string) Str::uuid(),
        ];
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => ['enabled' => false]);
    }
}
