<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\UserDashboardLayout;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * CRUD audit Observer para UserDashboardLayout (events.md Caso A). Layout
 * personalizado por usuario; el audit captura quién y cuándo modifica su
 * configuración de widgets.
 */
final class UserDashboardLayoutObserver
{
    private const APPLICATION_SLUG = 'maya-dashboard';

    private const ENTITY_TYPE = 'user_dashboard_layout';

    public function __construct(private readonly AuditPublisher $publisher) {}

    public function created(UserDashboardLayout $layout): void
    {
        DB::afterCommit(fn () => $this->publish('created', $layout, null, $layout->getAttributes()));
    }

    public function updated(UserDashboardLayout $layout): void
    {
        $previous = array_intersect_key($layout->getOriginal(), $layout->getChanges());
        DB::afterCommit(fn () => $this->publish('updated', $layout, $previous, $layout->getChanges()));
    }

    public function deleted(UserDashboardLayout $layout): void
    {
        DB::afterCommit(fn () => $this->publish('deleted', $layout, $layout->getAttributes(), null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, UserDashboardLayout $layout, ?array $previous, ?array $new): void
    {
        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType: self::ENTITY_TYPE,
            entityId: (string) $layout->getKey(),
            action: $action,
            userId: (string) (Auth::id() ?? 'system'),
            previousValue: $previous,
            newValue: $new,
        );
    }
}
