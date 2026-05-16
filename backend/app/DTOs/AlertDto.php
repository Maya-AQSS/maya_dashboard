<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\Alert;

final readonly class AlertDto
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        public int $id,
        public ?string $messageId,
        public ?string $ruleSlug,
        public ?AlertRuleDto $rule,
        public string $severity,
        public string $title,
        public ?string $source,
        public array $context,
        public ?string $acknowledgedAt,
        public ?string $acknowledgedBy,
        public ?string $resolvedAt,
        public ?string $resolvedBy,
        public string $createdAt,
    ) {}

    public static function fromModel(Alert $m): self
    {
        $rule = $m->relationLoaded('rule') && $m->rule !== null
            ? AlertRuleDto::fromModel($m->rule)
            : null;

        return new self(
            id: (int) $m->id,
            messageId: $m->message_id,
            ruleSlug: $m->rule_slug,
            rule: $rule,
            severity: (string) $m->severity,
            title: (string) $m->title,
            source: $m->source,
            context: is_array($m->context) ? $m->context : [],
            acknowledgedAt: $m->acknowledged_at?->toIso8601String(),
            acknowledgedBy: $m->acknowledged_by,
            resolvedAt: $m->resolved_at?->toIso8601String(),
            resolvedBy: $m->resolved_by,
            createdAt: $m->created_at?->toIso8601String() ?? '',
        );
    }
}
