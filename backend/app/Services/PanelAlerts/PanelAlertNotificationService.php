<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\Repositories\Contracts\AlertAudienceRepositoryInterface;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use App\Services\Contracts\PanelAlertNotificationServiceInterface;
use Illuminate\Support\Str;
use Maya\Messaging\Publishers\NotificationPublisher;
use Maya\Messaging\Publishers\ResilientLogPublisher;
use Throwable;

final class PanelAlertNotificationService implements PanelAlertNotificationServiceInterface
{
    private const CODE_NOTIFY_USER_FAILED = 'LAR-DASH-001';

    public function __construct(
        private readonly NotificationPublisher $notificationPublisher,
        private readonly ResilientLogPublisher $resilientLogPublisher,
        private readonly AlertAudienceRepositoryInterface $audience,
        private readonly PanelAlertRepositoryInterface $alerts,
    ) {}

    private function messagingAppSlug(): string
    {
        return (string) config('messaging.app');
    }

    public function notifyUsersOfNewAlert(int $alertId): int
    {
        $alert = $this->alerts->findDtoOrFail($alertId);

        $type = 'panel_alert.' . $alert->source;
        $title = Str::limit(strip_tags($alert->text), 120, '…');
        $isCritical = in_array($alert->severity, ['critical', 'high'], true);

        $metadata = [
            'panel_alert_id' => $alert->id,
            'severity' => $alert->severity,
            'source' => $alert->source,
            'action_label' => $alert->actionLabel,
            'action_url' => $alert->actionUrl,
        ];

        $recipientCount = 0;

        foreach ($this->audience->cursorRecipientIdsForAudience($alert->audience) as $recipientId) {
            try {
                $this->notificationPublisher->send(
                    type: $type,
                    recipientId: $recipientId,
                    title: $title,
                    body: $alert->text,
                    channels: ['app'],
                    metadata: $metadata,
                    app: $this->messagingAppSlug(),
                    isCritical: $isCritical,
                    scope: 'user',
                    severity: $alert->severity,
                    url: $alert->actionUrl,
                );
                $recipientCount++;
            } catch (Throwable $e) {
                $this->resilientLogPublisher->publishFromThrowable(
                    $e,
                    'medium',
                    self::CODE_NOTIFY_USER_FAILED,
                    [
                        'type' => $type,
                        'panel_alert_id' => $alert->id,
                        'recipient_keycloak_id' => $recipientId,
                    ],
                    $this->messagingAppSlug(),
                );
            }
        }

        return $recipientCount;
    }
}
