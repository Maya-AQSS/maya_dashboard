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
        public bool $isCritical = false,
        public ?string $scope = null,
        public ?string $acknowledgedAt = null,
        public ?string $acknowledgedBy = null,
        public ?string $resolvedAt = null,
        public ?string $resolvedBy = null,
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
            isCritical: (bool) $m->is_critical,
            scope: $m->scope,
            acknowledgedAt: $m->acknowledged_at?->toIso8601String(),
            acknowledgedBy: $m->acknowledged_by,
            resolvedAt: $m->resolved_at?->toIso8601String(),
            resolvedBy: $m->resolved_by,
        );
    }

    /**
     * Convert DTO to associative array for broadcast/serialization.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'message_id' => $this->messageId,
            'app' => $this->app,
            'type' => $this->type,
            'recipient_id' => $this->recipientId,
            'title' => $this->title,
            'body' => $this->body,
            'channels' => $this->channels,
            'metadata' => $this->metadata,
            'read_at' => $this->readAt,
            'created_at' => $this->createdAt,
            'is_critical' => $this->isCritical,
            'scope' => $this->scope,
            'acknowledged_at' => $this->acknowledgedAt,
            'acknowledged_by' => $this->acknowledgedBy,
            'resolved_at' => $this->resolvedAt,
            'resolved_by' => $this->resolvedBy,
        ];
    }
}
