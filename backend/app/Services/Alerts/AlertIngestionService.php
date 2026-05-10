<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DataTransferObjects\IncomingAlertPayload;
use App\Models\Alert;
use App\Models\AlertRule;
use Illuminate\Support\Carbon;

class AlertIngestionService
{
    private const SLUG_CACHE_REFRESH_EVERY = 100;

    /** @var array<string, true> */
    private array $validSlugs;
    private int $processed = 0;

    public function __construct()
    {
        $this->validSlugs = $this->loadValidSlugs();
    }

    public function ingest(array $payload, string $messageId): void
    {
        if (++$this->processed % self::SLUG_CACHE_REFRESH_EVERY === 0) {
            $this->validSlugs = $this->loadValidSlugs();
        }

        $dto = IncomingAlertPayload::fromArray($payload);

        $ruleSlug = ($dto->ruleSlug !== null && isset($this->validSlugs[$dto->ruleSlug]))
            ? $dto->ruleSlug
            : null; // orphan alert — persisted but FK decoupled

        Alert::updateOrCreate(
            ['message_id' => $messageId],
            [
                'rule_slug'  => $ruleSlug,
                'severity'   => $dto->severity,
                'title'      => $dto->title,
                'source'     => $dto->source,
                'context'    => $dto->context,
                'created_at' => $dto->createdAt !== null
                    ? Carbon::parse($dto->createdAt)
                    : now(),
            ],
        );
    }

    /** @return array<string, true> */
    private function loadValidSlugs(): array
    {
        return AlertRule::pluck('slug')->flip()->map(fn () => true)->all();
    }
}
