<?php

declare(strict_types=1);

namespace App\Observers;

/**
 * CRUD audit Observer para Notification (events.md Caso A). Las notificaciones
 * son consumidas por usuarios; el audit captura la creación (system o app
 * publisher), marcado como leído y borrado.
 */
final class NotificationObserver extends BaseAuditObserver
{
    protected function entityType(): string
    {
        return 'notification';
    }
}
