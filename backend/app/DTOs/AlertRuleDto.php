<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\AlertRule;

final readonly class AlertRuleDto
{
    /**
     * @param  array<string, mixed>  $contextTemplate
     */
    public function __construct(
        public int $id,
        public string $slug,
        public string $name,
        public ?string $description,
        public string $querySql,
        public string $severity,
        public ?string $scheduleCron,
        public bool $enabled,
        public array $contextTemplate,
        public ?string $lastEvaluatedAt,
        public ?string $createdAt,
        public ?string $updatedAt,
    ) {}

    public static function fromModel(AlertRule $m): self
    {
        return new self(
            id: (int) $m->id,
            slug: (string) $m->slug,
            name: (string) $m->name,
            description: $m->description,
            querySql: (string) $m->query_sql,
            severity: (string) $m->severity,
            scheduleCron: $m->schedule_cron,
            enabled: (bool) $m->enabled,
            contextTemplate: is_array($m->context_template) ? $m->context_template : [],
            lastEvaluatedAt: $m->last_evaluated_at?->toIso8601String(),
            createdAt: $m->created_at?->toIso8601String(),
            updatedAt: $m->updated_at?->toIso8601String(),
        );
    }
}
