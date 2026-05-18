<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\AlertRuleDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property AlertRuleDto $resource
 */
class AlertRuleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var AlertRuleDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'slug' => $dto->slug,
            'name' => $dto->name,
            'description' => $dto->description,
            'query_sql' => $dto->querySql,
            'severity' => $dto->severity,
            'schedule_cron' => $dto->scheduleCron,
            'enabled' => $dto->enabled,
            'context_template' => $dto->contextTemplate,
            'last_evaluated_at' => $dto->lastEvaluatedAt,
            'created_at' => $dto->createdAt,
            'updated_at' => $dto->updatedAt,
        ];
    }
}
