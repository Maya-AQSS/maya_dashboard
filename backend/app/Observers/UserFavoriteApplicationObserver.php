<?php

declare(strict_types=1);

namespace App\Observers;

/**
 * CRUD audit Observer para UserFavoriteApplication (events.md Caso A). El audit
 * captura el marcado/desmarcado de favoritos del catálogo de aplicaciones.
 */
final class UserFavoriteApplicationObserver extends BaseAuditObserver
{
    protected function entityType(): string
    {
        return 'user_favorite_application';
    }
}
