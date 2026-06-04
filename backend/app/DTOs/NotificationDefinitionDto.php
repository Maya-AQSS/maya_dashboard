<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\NotificationDefinition;

final readonly class NotificationDefinitionDto
{
    public function __construct(
        public int $id,
        public string $key,
        public string $sourceApp,
        public string $category,
        public string $label,
        public ?string $description,
        public bool $enabled,
        public string $defaultSeverity,
        public string $titleKey,
        public string $bodyKey,
        public ?string $urlTemplate,
        public ?string $targetApp,
        public ?string $scheduleCron,
        public ?string $lastEvaluatedAt,
    ) {}

    public static function fromModel(NotificationDefinition $m): self
    {
        return new self(
            id: (int) $m->id,
            key: (string) $m->key,
            sourceApp: (string) $m->source_app,
            category: (string) $m->category,
            label: (string) $m->label,
            description: $m->description,
            enabled: (bool) $m->enabled,
            defaultSeverity: (string) $m->default_severity,
            titleKey: (string) $m->title_key,
            bodyKey: (string) $m->body_key,
            urlTemplate: $m->url_template,
            targetApp: $m->target_app,
            scheduleCron: $m->schedule_cron,
            lastEvaluatedAt: $m->last_evaluated_at?->toIso8601String(),
        );
    }
}
