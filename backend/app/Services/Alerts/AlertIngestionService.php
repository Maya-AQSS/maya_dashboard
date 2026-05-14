<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DataTransferObjects\IncomingAlertPayload;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class AlertIngestionService
{
    private const SLUG_CACHE_TTL = 300;

    public function __construct(
        private readonly AlertRepositoryInterface $alertRepo,
        private readonly AlertRuleRepositoryInterface $ruleRepo,
    ) {}

    public function ingest(array $payload, string $messageId): void
    {
        Validator::make(
            ['message_id' => $messageId],
            ['message_id' => 'required|uuid'],
        )->validate();

        $dto = IncomingAlertPayload::fromArray($payload);

        $validSlugs = Cache::remember(
            AlertRule::VALID_SLUGS_CACHE_KEY,
            self::SLUG_CACHE_TTL,
            fn (): array => $this->ruleRepo->validSlugLookup(),
        );

        $ruleSlug = ($dto->ruleSlug !== null && isset($validSlugs[$dto->ruleSlug]))
            ? $dto->ruleSlug
            : null; // orphan alert — persisted but FK decoupled

        $this->alertRepo->upsertByMessageId($messageId, [
            'rule_slug'  => $ruleSlug,
            'severity'   => $dto->severity,
            'title'      => $dto->title,
            'source'     => $dto->source,
            'context'    => $dto->context,
            'created_at' => $dto->createdAt !== null
                ? Carbon::parse($dto->createdAt)
                : now(),
        ]);
    }
}
