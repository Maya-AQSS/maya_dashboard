<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\PanelAlertDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property PanelAlertDto $resource
 */
class PanelAlertResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var PanelAlertDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'text' => $dto->text,
            'default_locale' => $dto->defaultLocale,
            'translations' => $dto->translations,
            'severity' => $dto->severity,
            'action_label' => $dto->actionLabel,
            'action_url' => $dto->actionUrl,
            'visible_from' => $dto->visibleFrom,
            'visible_until' => $dto->visibleUntil,
            'schedule_cron' => $dto->scheduleCron,
            'duration_minutes' => $dto->durationMinutes,
            'last_materialized_at' => $dto->lastMaterializedAt,
            'source' => $dto->source,
            'created_by' => $dto->createdBy,
            'created_at' => $dto->createdAt,
            'updated_at' => $dto->updatedAt,
            ...$dto->audience->toApiArray(),
        ];
    }
}
