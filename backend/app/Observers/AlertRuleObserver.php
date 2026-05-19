<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\AlertRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * Publishes an audit event to maya.audit on every mutation of an
 * alert_rules row, capturing the actor's Keycloak subject and the
 * before/after values of `query_sql` so forensic queries can
 * reconstruct who introduced any dangerous SQL.
 *
 * Routing key: maya_dashboard.alert_rule.<action>
 */
class AlertRuleObserver
{
    private const APPLICATION_SLUG = 'maya-dashboard';

    private const ENTITY_TYPE = 'alert_rule';

    /**
     * Fields whose mutation is forensically interesting. Skips noise such as
     * `last_evaluated_at`, which is touched every cron tick by EvaluateAlertRules.
     *
     * @var list<string>
     */
    private const TRACKED_FIELDS = [
        'slug', 'name', 'description', 'query_sql', 'severity',
        'schedule_cron', 'enabled', 'context_template',
    ];

    public function __construct(
        private readonly AuditPublisher $publisher,
        private readonly Request $request,
    ) {}

    public function created(AlertRule $rule): void
    {
        $snapshot = $this->snapshot($rule);
        DB::afterCommit(fn () => $this->publish('created', $rule, previous: null, new: $snapshot));
    }

    public function updated(AlertRule $rule): void
    {
        $previous = [];
        $new = [];
        foreach ($rule->getChanges() as $field => $value) {
            if (! in_array($field, self::TRACKED_FIELDS, true)) {
                continue;
            }
            $previous[$field] = $rule->getOriginal($field);
            $new[$field] = $value;
        }

        if ($new === []) {
            return;
        }

        DB::afterCommit(fn () => $this->publish('updated', $rule, previous: $previous, new: $new));
    }

    public function deleted(AlertRule $rule): void
    {
        $snapshot = $this->snapshot($rule);
        DB::afterCommit(fn () => $this->publish('deleted', $rule, previous: $snapshot, new: null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, AlertRule $rule, ?array $previous, ?array $new): void
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

    /**
     * @return array<string, mixed>
     */
    private function snapshot(AlertRule $rule): array
    {
        return [
            'slug' => $rule->slug,
            'name' => $rule->name,
            'description' => $rule->description,
            'query_sql' => $rule->query_sql,
            'severity' => $rule->severity,
            'schedule_cron' => $rule->schedule_cron,
            'enabled' => (bool) $rule->enabled,
            'context_template' => $rule->context_template,
        ];
    }
}
