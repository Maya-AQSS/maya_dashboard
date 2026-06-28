<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\NotificationDefinitionDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property NotificationDefinitionDto $resource
 */
class NotificationDefinitionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'key' => $dto->key,
            'source_app' => $dto->sourceApp,
            'category' => $dto->category,
            'label' => $dto->label,
            'description' => $dto->description,
            'enabled' => $dto->enabled,
            'default_severity' => $dto->defaultSeverity,
            'title_key' => $dto->titleKey,
            'body_key' => $dto->bodyKey,
            'url_template' => $dto->urlTemplate,
            'target_app' => $dto->targetApp,
            'schedule_cron' => $dto->scheduleCron,
            'last_evaluated_at' => $dto->lastEvaluatedAt,
        ];
    }
}
