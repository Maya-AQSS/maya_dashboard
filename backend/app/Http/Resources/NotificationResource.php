<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\NotificationDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property NotificationDto $resource
 */
class NotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var NotificationDto $dto */
        $dto = $this->resource;

        // Resolve to the requesting user's locale (set by the i18n middleware),
        // and also expose the raw keys/params for client-side re-resolution.
        return [
            'id' => $dto->id,
            'message_id' => $dto->messageId,
            'app' => $dto->app,
            'type' => $dto->type,
            'recipient_id' => $dto->recipientId,
            'title' => $dto->resolvedTitle(),
            'body' => $dto->resolvedBody(),
            'title_key' => $dto->titleKey,
            'body_key' => $dto->bodyKey,
            'params' => $dto->params,
            'severity' => $dto->severity,
            'is_critical' => $dto->isCritical(),
            'url' => $dto->url,
            'target_app' => $dto->targetApp,
            'channels' => $dto->channels,
            'metadata' => $dto->metadata,
            'read_at' => $dto->readAt,
            'created_at' => $dto->createdAt,
            'scope' => $dto->scope,
            'acknowledged_at' => $dto->acknowledgedAt,
            'acknowledged_by' => $dto->acknowledgedBy,
            'resolved_at' => $dto->resolvedAt,
            'resolved_by' => $dto->resolvedBy,
        ];
    }
}
