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

        return [
            'id' => $dto->id,
            'message_id' => $dto->messageId,
            'app' => $dto->app,
            'type' => $dto->type,
            'recipient_id' => $dto->recipientId,
            'title' => $dto->title,
            'body' => $dto->body,
            'channels' => $dto->channels,
            'metadata' => $dto->metadata,
            'read_at' => $dto->readAt,
            'created_at' => $dto->createdAt,
            'is_critical' => $dto->isCritical,
            'scope' => $dto->scope,
            'acknowledged_at' => $dto->acknowledgedAt,
            'acknowledged_by' => $dto->acknowledgedBy,
            'resolved_at' => $dto->resolvedAt,
            'resolved_by' => $dto->resolvedBy,
        ];
    }
}
