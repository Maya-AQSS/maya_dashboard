<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * CRUD audit Observer para Notification (events.md Caso A). Las notificaciones
 * son consumidas por usuarios; el audit captura la creación (system o app
 * publisher), marcado como leído y borrado.
 */
final class NotificationObserver
{
    private const APPLICATION_SLUG = 'maya_dashboard';
    private const ENTITY_TYPE      = 'notification';

    public function __construct(private readonly AuditPublisher $publisher) {}

    public function created(Notification $notification): void
    {
        DB::afterCommit(fn () => $this->publish('created', $notification, null, $notification->getAttributes()));
    }

    public function updated(Notification $notification): void
    {
        $previous = array_intersect_key($notification->getOriginal(), $notification->getChanges());
        DB::afterCommit(fn () => $this->publish('updated', $notification, $previous, $notification->getChanges()));
    }

    public function deleted(Notification $notification): void
    {
        DB::afterCommit(fn () => $this->publish('deleted', $notification, $notification->getAttributes(), null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, Notification $notification, ?array $previous, ?array $new): void
    {
        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType:      self::ENTITY_TYPE,
            entityId:        (string) $notification->getKey(),
            action:          $action,
            userId:          (string) (Auth::id() ?? 'system'),
            previousValue:   $previous,
            newValue:        $new,
        );
    }
}
