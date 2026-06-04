<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\Notification;
use App\Support\NotificationContent;

final readonly class NotificationDto
{
    /**
     * @param  list<string>  $channels
     * @param  array<string, mixed>  $metadata
     * @param  array<string, mixed>  $params
     */
    public function __construct(
        public int $id,
        public ?string $messageId,
        public string $app,
        public string $type,
        public string $recipientId,
        public ?string $title,
        public ?string $body,
        public ?string $titleKey,
        public ?string $bodyKey,
        public array $params,
        public string $severity,
        public ?string $url,
        public ?string $targetApp,
        public array $channels,
        public array $metadata,
        public ?string $readAt,
        public string $createdAt,
        public ?string $scope = null,
        public ?string $acknowledgedAt = null,
        public ?string $acknowledgedBy = null,
        public ?string $resolvedAt = null,
        public ?string $resolvedBy = null,
    ) {}

    public function isCritical(): bool
    {
        return in_array($this->severity, ['critical', 'high'], true);
    }

    public static function fromModel(Notification $m): self
    {
        return new self(
            id: (int) $m->id,
            messageId: $m->message_id,
            app: (string) $m->app,
            type: (string) $m->type,
            recipientId: (string) $m->recipient_id,
            title: $m->title,
            body: $m->body,
            titleKey: $m->title_key,
            bodyKey: $m->body_key,
            params: is_array($m->params) ? $m->params : [],
            severity: (string) ($m->severity ?? 'info'),
            url: $m->url,
            targetApp: $m->target_app,
            channels: is_array($m->channels) ? array_values(array_map('strval', $m->channels)) : [],
            metadata: is_array($m->metadata) ? $m->metadata : [],
            readAt: $m->read_at?->toIso8601String(),
            createdAt: $m->created_at?->toIso8601String() ?? '',
            scope: $m->scope,
            acknowledgedAt: $m->acknowledged_at?->toIso8601String(),
            acknowledgedBy: $m->acknowledged_by,
            resolvedAt: $m->resolved_at?->toIso8601String(),
            resolvedBy: $m->resolved_by,
        );
    }

    /**
     * Title resolved for a locale (null → current app locale).
     */
    public function resolvedTitle(?string $locale = null): string
    {
        return NotificationContent::resolveTitle($this->titleKey, $this->title, $this->params, $locale);
    }

    public function resolvedBody(?string $locale = null): ?string
    {
        return NotificationContent::resolveBody($this->bodyKey, $this->body, $this->params, $locale);
    }

    /**
     * Array for broadcast/serialization. Carries both the resolved text (current
     * locale) and the raw keys/params so the frontend can re-resolve client-side.
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
            'title' => $this->resolvedTitle(),
            'body' => $this->resolvedBody(),
            'title_key' => $this->titleKey,
            'body_key' => $this->bodyKey,
            'params' => (object) $this->params,
            'severity' => $this->severity,
            'is_critical' => $this->isCritical(),
            'url' => $this->url,
            'target_app' => $this->targetApp,
            'channels' => $this->channels,
            'metadata' => $this->metadata,
            'read_at' => $this->readAt,
            'created_at' => $this->createdAt,
            'scope' => $this->scope,
            'acknowledged_at' => $this->acknowledgedAt,
            'acknowledged_by' => $this->acknowledgedBy,
            'resolved_at' => $this->resolvedAt,
            'resolved_by' => $this->resolvedBy,
        ];
    }
}
