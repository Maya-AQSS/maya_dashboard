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

    public ?string $titleKey;

    public ?string $bodyKey;

    /** @var array<string, mixed> */
    public array $params;

    public ?string $severity;

    public ?string $url;

    /** @var array<string> */
    public array $channels;

    public ?array $metadata;

    public ?string $createdAt;

    public bool $isCritical;

    public string $scope;

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
        $this->titleKey = isset($data['title_key']) && $data['title_key'] !== '' ? (string) $data['title_key'] : null;
        $this->bodyKey = isset($data['body_key']) && $data['body_key'] !== '' ? (string) $data['body_key'] : null;
        $this->params = $this->normalizeParams($data['params'] ?? null);
        $this->severity = isset($data['severity']) && $data['severity'] !== '' ? (string) $data['severity'] : null;
        $this->url = isset($data['url']) && $data['url'] !== '' ? (string) $data['url'] : null;
        $this->channels = is_array($data['channels'] ?? null) ? $data['channels'] : ['app'];
        $this->metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : null;
        $this->createdAt = isset($data['created_at']) ? (string) $data['created_at'] : null;
        $this->isCritical = (bool) ($data['is_critical'] ?? false);
        $this->scope = (string) ($data['scope'] ?? 'user');
    }

    /**
     * AMQP serializes empty `params` as a stdClass `{}`; normalize to array.
     *
     * @return array<string, mixed>
     */
    private function normalizeParams(mixed $params): array
    {
        if (is_array($params)) {
            return $params;
        }

        if (is_object($params)) {
            return (array) $params;
        }

        return [];
    }

    /** @throws \InvalidArgumentException */
    public static function fromArray(array $data): self
    {
        return new self($data);
    }
}
