<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\Models\PanelAlert;
use App\Repositories\Contracts\UserRepositoryInterface;
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
        private readonly UserRepositoryInterface $users,
    ) {}

    private function messagingAppSlug(): string
    {
        return (string) config('messaging.app');
    }

    public function notifyUsersOfNewAlert(PanelAlert $alert): int
    {
        $type = $alert->source === 'rule' ? 'panel_alert.rule' : 'panel_alert.manual';
        $title = Str::limit($alert->text, 120, '…');
        $isCritical = in_array($alert->severity, ['critical', 'high'], true);

        $metadata = [
            'panel_alert_id' => $alert->id,
            'severity' => $alert->severity,
            'source' => $alert->source,
            'action_label' => $alert->action_label,
            'action_url' => $alert->action_url,
        ];

        if ($alert->rule_id !== null) {
            $metadata['rule_id'] = $alert->rule_id;
        }

        $recipientCount = 0;

        foreach ($this->users->cursorActive() as $user) {
            try {
                $this->notificationPublisher->send(
                    type: $type,
                    recipientId: $user->id,
                    title: $title,
                    body: $alert->text,
                    channels: ['app'],
                    metadata: $metadata,
                    app: $this->messagingAppSlug(),
                    isCritical: $isCritical,
                    scope: 'user',
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
                        'recipient_keycloak_id' => $user->id,
                    ],
                    $this->messagingAppSlug(),
                );
            }
        }

        return $recipientCount;
    }
}
