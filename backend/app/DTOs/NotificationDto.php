<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\Notification;

final readonly class NotificationDto
{
    /**
     * @param  list<string>  $channels
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public int $id,
        public ?string $messageId,
        public string $app,
        public string $type,
        public string $recipientId,
        public string $title,
        public ?string $body,
        public array $channels,
        public array $metadata,
        public ?string $readAt,
        public string $createdAt,
    ) {}

    public static function fromModel(Notification $m): self
    {
        return new self(
            id: (int) $m->id,
            messageId: $m->message_id,
            app: (string) $m->app,
            type: (string) $m->type,
            recipientId: (string) $m->recipient_id,
            title: (string) $m->title,
            body: $m->body,
            channels: is_array($m->channels) ? array_values(array_map('strval', $m->channels)) : [],
            metadata: is_array($m->metadata) ? $m->metadata : [],
            readAt: $m->read_at?->toIso8601String(),
            createdAt: $m->created_at?->toIso8601String() ?? '',
        );
    }
}
