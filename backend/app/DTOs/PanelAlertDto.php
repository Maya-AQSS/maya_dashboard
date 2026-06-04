<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\PanelAlert;

final readonly class PanelAlertDto
{
    public function __construct(
        public int $id,
        public string $text,
        public string $severity,
        public ?string $actionLabel,
        public ?string $actionUrl,
        public string $visibleFrom,
        public ?string $visibleUntil,
        public ?string $scheduleCron,
        public ?int $durationMinutes,
        public ?string $lastMaterializedAt,
        public string $source,
        public string $createdBy,
        public string $createdAt,
        public string $updatedAt,
        public AlertAudienceDto $audience,
    ) {}

    public function isRecurring(): bool
    {
        return $this->scheduleCron !== null;
    }

    public static function fromModel(PanelAlert $m): self
    {
        return new self(
            id: (int) $m->id,
            text: (string) $m->text,
            severity: (string) $m->severity,
            actionLabel: $m->action_label,
            actionUrl: $m->action_url,
            visibleFrom: $m->visible_from->toIso8601String(),
            visibleUntil: $m->visible_until?->toIso8601String(),
            scheduleCron: $m->schedule_cron,
            durationMinutes: $m->duration_minutes !== null ? (int) $m->duration_minutes : null,
            lastMaterializedAt: $m->last_materialized_at?->toIso8601String(),
            source: (string) $m->source,
            createdBy: (string) $m->created_by,
            createdAt: $m->created_at?->toIso8601String() ?? '',
            updatedAt: $m->updated_at?->toIso8601String() ?? '',
            audience: AlertAudienceDto::fromModel($m),
        );
    }
}
