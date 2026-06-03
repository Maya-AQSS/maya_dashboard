<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\PanelAlertRuleDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property PanelAlertRuleDto $resource
 */
class PanelAlertRuleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var PanelAlertRuleDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'name' => $dto->name,
            'description' => $dto->description,
            'event_type' => $dto->eventType,
            'conditions' => $dto->conditions,
            'alert_text' => $dto->alertText,
            'severity' => $dto->severity,
            'action_label' => $dto->actionLabel,
            'action_url' => $dto->actionUrl,
            'visible_duration_hours' => $dto->visibleDurationHours,
            'max_frequency_minutes' => $dto->maxFrequencyMinutes,
            'is_active' => $dto->isActive,
            'last_triggered_at' => $dto->lastTriggeredAt,
            'created_by' => $dto->createdBy,
            'created_at' => $dto->createdAt,
            'updated_at' => $dto->updatedAt,
            ...$dto->audience->toApiArray(),
        ];
    }
}
