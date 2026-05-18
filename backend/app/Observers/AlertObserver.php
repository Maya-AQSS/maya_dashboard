<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Alert;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * CRUD audit Observer para Alert (events.md Caso A). Alertas son creadas por
 * EvaluateAlertRules (cron) y leídas/editadas por usuarios. El audit captura
 * autoría de creación (system) y mutaciones manuales (acknowledge, cierre, etc.).
 */
final class AlertObserver
{
    private const APPLICATION_SLUG = 'maya_dashboard';

    private const ENTITY_TYPE = 'alert';

    public function __construct(private readonly AuditPublisher $publisher) {}

    public function created(Alert $alert): void
    {
        DB::afterCommit(fn () => $this->publish('created', $alert, null, $alert->getAttributes()));
    }

    public function updated(Alert $alert): void
    {
        $previous = array_intersect_key($alert->getOriginal(), $alert->getChanges());
        DB::afterCommit(fn () => $this->publish('updated', $alert, $previous, $alert->getChanges()));
    }

    public function deleted(Alert $alert): void
    {
        DB::afterCommit(fn () => $this->publish('deleted', $alert, $alert->getAttributes(), null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, Alert $alert, ?array $previous, ?array $new): void
    {
        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType: self::ENTITY_TYPE,
            entityId: (string) $alert->getKey(),
            action: $action,
            userId: (string) (Auth::id() ?? 'system'),
            previousValue: $previous,
            newValue: $new,
        );
    }
}
