<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\NotificationRuleDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property NotificationRuleDto $resource
 */
class NotificationRuleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'evaluator_key' => $dto->evaluatorKey,
            'source_app' => $dto->sourceApp,
            'name' => $dto->name,
            'description' => $dto->description,
            'params' => $dto->params,
            'schedule_cron' => $dto->scheduleCron,
            'severity' => $dto->severity,
            'enabled' => $dto->enabled,
            'created_by' => $dto->createdBy,
            'created_at' => $dto->createdAt,
            'updated_at' => $dto->updatedAt,
            ...$dto->audience->toApiArray(),
        ];
    }
}
