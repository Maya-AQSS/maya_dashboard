<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\PanelAlertRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * Publishes an audit event to maya.audit on every mutation of a
 * panel_alert_rules row, capturing the actor's Keycloak subject and the
 * before/after values so forensic queries can reconstruct who created,
 * modified or removed a panel alert rule.
 *
 * Routing key: maya_dashboard.panel_alert_rule.<action>
 */
final class PanelAlertRuleObserver
{
    private const APPLICATION_SLUG = 'maya-dashboard';

    private const ENTITY_TYPE = 'panel_alert_rule';

    public function __construct(
        private readonly AuditPublisher $publisher,
        private readonly Request $request,
    ) {}

    public function created(PanelAlertRule $rule): void
    {
        $snapshot = $rule->getAttributes();
        DB::afterCommit(fn () => $this->publish('created', $rule, previous: null, new: $snapshot));
    }

    public function updated(PanelAlertRule $rule): void
    {
        $previous = array_intersect_key($rule->getOriginal(), $rule->getChanges());
        $new = $rule->getChanges();

        if ($new === []) {
            return;
        }

        DB::afterCommit(fn () => $this->publish('updated', $rule, previous: $previous, new: $new));
    }

    public function deleted(PanelAlertRule $rule): void
    {
        $snapshot = $rule->getAttributes();
        DB::afterCommit(fn () => $this->publish('deleted', $rule, previous: $snapshot, new: null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, PanelAlertRule $rule, ?array $previous, ?array $new): void
    {
        $jwtUser = $this->request->attributes->get('jwt_user');
        $userId = is_array($jwtUser) ? (string) ($jwtUser['id'] ?? 'system') : 'system';

        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType: self::ENTITY_TYPE,
            entityId: (string) $rule->getKey(),
            action: $action,
            userId: $userId,
            previousValue: $previous,
            newValue: $new,
            ipAddress: $this->request->ip(),
            userAgent: $this->request->userAgent(),
        );
    }
}
