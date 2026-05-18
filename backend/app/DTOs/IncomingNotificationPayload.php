<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class IncomingNotificationPayload
{
    public string $app;

    public string $type;

    public string $recipientKeycloakId;

    public string $title;

    public string $body;

    /** @var array<string> */
    public array $channels;

    public ?array $metadata;

    public ?string $createdAt;

    /** @throws \InvalidArgumentException */
    private function __construct(array $data)
    {
        $this->app = (string) ($data['app'] ?? '');
        $this->type = (string) ($data['type'] ?? '');

        if ($this->app === '') {
            throw new \InvalidArgumentException('app es obligatorio');
        }
        if ($this->type === '') {
            throw new \InvalidArgumentException('type es obligatorio');
        }

        $keycloakId = $data['recipient_keycloak_id']
            ?? ($data['metadata']['recipient_keycloak_id'] ?? null);

        $this->recipientKeycloakId = is_string($keycloakId) ? $keycloakId : '';
        $this->title = (string) ($data['title'] ?? '');
        $this->body = (string) ($data['body'] ?? '');
        $this->channels = is_array($data['channels'] ?? null) ? $data['channels'] : ['app'];
        $this->metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : null;
        $this->createdAt = isset($data['created_at']) ? (string) $data['created_at'] : null;
    }

    /** @throws \InvalidArgumentException */
    public static function fromArray(array $data): self
    {
        return new self($data);
    }
}
