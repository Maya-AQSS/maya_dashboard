<?php

declare(strict_types=1);

namespace App\Observers;

/**
 * CRUD audit Observer para UserDashboardLayout (events.md Caso A). Layout
 * personalizado por usuario; el audit captura quién y cuándo modifica su
 * configuración de widgets.
 */
final class UserDashboardLayoutObserver extends BaseAuditObserver
{
    protected function entityType(): string
    {
        return 'user_dashboard_layout';
    }
}
