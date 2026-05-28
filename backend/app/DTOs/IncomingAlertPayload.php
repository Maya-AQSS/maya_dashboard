<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class IncomingAlertPayload
{
    public ?string $ruleSlug;

    public string $severity;

    public string $title;

    public string $source;

    public array $context;

    public ?string $createdAt;

    private function __construct(array $data)
    {
        $slug = $data['rule_slug'] ?? null;
        $this->ruleSlug = (is_string($slug) && $slug !== '') ? $slug : null;
        $this->severity = (string) ($data['severity'] ?? '');
        $this->title = (string) ($data['title'] ?? '');
        $this->source = (string) ($data['source'] ?? 'app.publish');
        $this->context = is_array($data['context'] ?? null) ? $data['context'] : [];
        $this->createdAt = isset($data['created_at']) ? (string) $data['created_at'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    /**
     * Validates that the AMQP message ID is a well-formed UUID.
     * Kept in the DTO layer so the Service remains free of Validator imports.
     *
     * @throws \InvalidArgumentException
     */
    public static function assertValidMessageId(string $messageId): void
    {
        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
        if ($messageId === '' || preg_match($pattern, $messageId) !== 1) {
            throw new \InvalidArgumentException(
                sprintf('Invalid message_id (must be UUID): "%s"', $messageId),
            );
        }
    }
}
