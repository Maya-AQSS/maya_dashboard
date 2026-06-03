<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\PanelAlert;
use App\Services\Contracts\PanelAlertNotificationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * Publishes an audit event to maya.audit on every mutation of a
 * panel_alerts row, capturing the actor's Keycloak subject and the
 * before/after values so forensic queries can reconstruct who created,
 * modified or removed a visible panel alert.
 *
 * On create, also fans out in-app notifications to all active users
 * via PanelAlertNotificationService (after commit).
 *
 * Routing key: maya_dashboard.panel_alert.<action>
 */
final class PanelAlertObserver
{
    private const APPLICATION_SLUG = 'maya-dashboard';

    private const ENTITY_TYPE = 'panel_alert';

    public function __construct(
        private readonly AuditPublisher $publisher,
        private readonly PanelAlertNotificationServiceInterface $notifications,
        private readonly Request $request,
    ) {}

    public function created(PanelAlert $alert): void
    {
        $snapshot = $alert->getAttributes();
        DB::afterCommit(function () use ($alert, $snapshot): void {
            $this->publish('created', $alert, previous: null, new: $snapshot);

            $recipientCount = $this->notifications->notifyUsersOfNewAlert($alert->id);

            $this->publish('notified', $alert, previous: null, new: [
                'type' => $alert->source === 'rule' ? 'panel_alert.rule' : 'panel_alert.manual',
                'recipient_count' => $recipientCount,
                'severity' => $alert->severity,
                'source' => $alert->source,
            ]);
        });
    }

    public function updated(PanelAlert $alert): void
    {
        $previous = array_intersect_key($alert->getOriginal(), $alert->getChanges());
        $new = $alert->getChanges();

        if ($new === []) {
            return;
        }

        DB::afterCommit(fn () => $this->publish('updated', $alert, previous: $previous, new: $new));
    }

    public function deleted(PanelAlert $alert): void
    {
        $snapshot = $alert->getAttributes();
        DB::afterCommit(fn () => $this->publish('deleted', $alert, previous: $snapshot, new: null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, PanelAlert $alert, ?array $previous, ?array $new): void
    {
        $jwtUser = $this->request->attributes->get('jwt_user');
        $userId = is_array($jwtUser) ? (string) ($jwtUser['id'] ?? 'system') : 'system';

        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType: self::ENTITY_TYPE,
            entityId: (string) $alert->getKey(),
            action: $action,
            userId: $userId,
            previousValue: $previous,
            newValue: $new,
            ipAddress: $this->request->ip(),
            userAgent: $this->request->userAgent(),
        );
    }
}
