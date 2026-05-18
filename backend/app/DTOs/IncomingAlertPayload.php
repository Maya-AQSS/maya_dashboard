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
}
