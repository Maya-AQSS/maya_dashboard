<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\AlertDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property AlertDto $resource
 */
class AlertResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var AlertDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'message_id' => $dto->messageId,
            'rule_slug' => $dto->ruleSlug,
            'rule' => $dto->rule === null ? null : new AlertRuleResource($dto->rule),
            'severity' => $dto->severity,
            'title' => $dto->title,
            'source' => $dto->source,
            'context' => $dto->context,
            'acknowledged_at' => $dto->acknowledgedAt,
            'acknowledged_by' => $dto->acknowledgedBy,
            'resolved_at' => $dto->resolvedAt,
            'resolved_by' => $dto->resolvedBy,
            'created_at' => $dto->createdAt,
        ];
    }
}
