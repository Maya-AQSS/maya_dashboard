<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DTOs\IncomingAlertPayload;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Contracts\AlertIngestionServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Log;
use Maya\Messaging\Publishers\NotificationPublisher;
use Throwable;

class AlertIngestionService implements AlertIngestionServiceInterface
{
    private const SLUG_CACHE_TTL = 300;

    public function __construct(
        private readonly AlertRepositoryInterface $alertRepo,
        private readonly AlertRuleRepositoryInterface $ruleRepo,
        private readonly NotificationPublisher $notificationPublisher,
    ) {}

    public function ingest(array $payload, string $messageId): void
    {
        IncomingAlertPayload::assertValidMessageId($messageId);

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
            'rule_slug' => $ruleSlug,
            'severity' => $dto->severity,
            'title' => $dto->title,
            'source' => $dto->source,
            'context' => $dto->context,
            'created_at' => $dto->createdAt !== null
                ? Date::parse($dto->createdAt)
                : now(),
        ]);

        $this->notifyRuleCreator($ruleSlug, $dto);
    }

    private function notifyRuleCreator(?string $ruleSlug, IncomingAlertPayload $dto): void
    {
        if ($ruleSlug === null) {
            return;
        }

        try {
            $rule = $this->ruleRepo->findBySlug($ruleSlug);

            if ($rule === null) {
                return;
            }

            $creatorId = $rule->created_by_id;

            if (! is_string($creatorId) || $creatorId === '') {
                return;
            }

            $this->notificationPublisher->send(
                type: 'alert.fired',
                recipientId: $creatorId,
                title: "Alerta disparada: {$dto->title}",
                body: "La regla \"{$rule->name}\" ha detectado " . ($dto->context['matched_rows'] ?? 'N') . " filas. Severidad: {$dto->severity}",
                channels: ['app'],
                metadata: [
                    'rule_slug' => $dto->ruleSlug,
                    'severity'  => $dto->severity,
                    'source'    => $dto->source,
                ],
            );
        } catch (Throwable $e) {
            Log::warning('alert.notify_rule_creator_failed', [
                'rule_slug' => $ruleSlug,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}
