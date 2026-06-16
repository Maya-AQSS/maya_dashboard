<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\NotificationRule;

final readonly class NotificationRuleDto
{
    /**
     * @param  array<string, mixed>  $params
     * @param  array{logic: string, items: list<array<string, mixed>>}|null  $conditions
     */
    public function __construct(
        public int $id,
        public string $evaluatorKey,
        public string $sourceApp,
        public string $name,
        public ?string $description,
        public array $params,
        public ?array $conditions,
        public string $scheduleCron,
        public ?string $severity,
        public bool $enabled,
        public ?string $createdBy,
        public string $createdAt,
        public string $updatedAt,
        public AlertAudienceDto $audience,
    ) {}

    public static function fromModel(NotificationRule $m): self
    {
        return new self(
            id: (int) $m->id,
            evaluatorKey: (string) $m->evaluator_key,
            sourceApp: (string) $m->source_app,
            name: (string) $m->name,
            description: $m->description,
            params: is_array($m->params) ? $m->params : [],
            conditions: is_array($m->conditions) ? $m->conditions : null,
            scheduleCron: (string) $m->schedule_cron,
            severity: $m->severity,
            enabled: (bool) $m->enabled,
            createdBy: $m->created_by,
            createdAt: $m->created_at?->toIso8601String() ?? '',
            updatedAt: $m->updated_at?->toIso8601String() ?? '',
            audience: AlertAudienceDto::fromModel($m),
        );
    }
}
