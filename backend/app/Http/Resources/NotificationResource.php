<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DataTransferObjects\NotificationDto;
use App\Models\Notification;
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
        $dto = $this->resource instanceof Notification
            ? NotificationDto::fromModel($this->resource)
            : $this->resource;

        return [
            'id'           => $dto->id,
            'message_id'   => $dto->messageId,
            'app'          => $dto->app,
            'type'         => $dto->type,
            'recipient_id' => $dto->recipientId,
            'title'        => $dto->title,
            'body'         => $dto->body,
            'channels'     => $dto->channels,
            'metadata'     => $dto->metadata,
            'read_at'      => $dto->readAt,
            'created_at'   => $dto->createdAt,
        ];
    }
}
