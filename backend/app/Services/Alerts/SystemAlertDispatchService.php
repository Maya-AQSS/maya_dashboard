<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DTOs\AlertAudienceDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertAudienceRepositoryInterface;
use App\Services\Contracts\SystemAlertDispatchServiceInterface;
use Maya\Messaging\Publishers\AlertPublisher;

final class SystemAlertDispatchService implements SystemAlertDispatchServiceInterface
{
    public function __construct(
        private readonly AlertPublisher $publisher,
        private readonly AlertAudienceRepositoryInterface $audience,
    ) {}

    public function dispatchTriggeredRule(AlertRule $rule, array $context): void
    {
        $audience = AlertAudienceDto::fromModel($rule);
        $recipientIds = [];

        if (! $audience->notifyAll) {
            foreach ($this->audience->cursorRecipientIdsForAudience($audience) as $recipientId) {
                $recipientIds[] = $recipientId;
            }
        }

        $this->publisher->publish(
            ruleSlug: (string) $rule->slug,
            severity: (string) $rule->severity,
            title: (string) $rule->name,
            context: $context,
            source: 'logs.aggregation',
            notifyAll: $audience->notifyAll,
            recipientIds: $recipientIds,
        );
    }
}
