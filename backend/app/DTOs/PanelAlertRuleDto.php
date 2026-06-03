<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\PanelAlertRule;

final readonly class PanelAlertRuleDto
{
    /**
     * @param  array<int, mixed>|null  $conditions
     */
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public string $eventType,
        public ?array $conditions,
        public string $alertText,
        public string $severity,
        public ?string $actionLabel,
        public ?string $actionUrl,
        public ?int $visibleDurationHours,
        public ?int $maxFrequencyMinutes,
        public bool $isActive,
        public ?string $lastTriggeredAt,
        public string $createdBy,
        public string $createdAt,
        public string $updatedAt,
        public AlertAudienceDto $audience,
    ) {}

    public static function fromModel(PanelAlertRule $m): self
    {
        return new self(
            id: (int) $m->id,
            name: (string) $m->name,
            description: $m->description,
            eventType: (string) $m->event_type,
            conditions: is_array($m->conditions) ? $m->conditions : null,
            alertText: (string) $m->alert_text,
            severity: (string) $m->severity,
            actionLabel: $m->action_label,
            actionUrl: $m->action_url,
            visibleDurationHours: $m->visible_duration_hours !== null ? (int) $m->visible_duration_hours : null,
            maxFrequencyMinutes: $m->max_frequency_minutes !== null ? (int) $m->max_frequency_minutes : null,
            isActive: (bool) $m->is_active,
            lastTriggeredAt: $m->last_triggered_at?->toIso8601String(),
            createdBy: (string) $m->created_by,
            createdAt: $m->created_at?->toIso8601String() ?? '',
            updatedAt: $m->updated_at?->toIso8601String() ?? '',
            audience: AlertAudienceDto::fromModel($m),
        );
    }
}
