<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\UserFavoriteApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * CRUD audit Observer para UserFavoriteApplication (events.md Caso A). El audit
 * captura el marcado/desmarcado de favoritos del catálogo de aplicaciones.
 */
final class UserFavoriteApplicationObserver
{
    private const APPLICATION_SLUG = 'maya-dashboard';

    private const ENTITY_TYPE = 'user_favorite_application';

    public function __construct(private readonly AuditPublisher $publisher) {}

    public function created(UserFavoriteApplication $favorite): void
    {
        DB::afterCommit(fn () => $this->publish('created', $favorite, null, $favorite->getAttributes()));
    }

    public function updated(UserFavoriteApplication $favorite): void
    {
        $previous = array_intersect_key($favorite->getOriginal(), $favorite->getChanges());
        DB::afterCommit(fn () => $this->publish('updated', $favorite, $previous, $favorite->getChanges()));
    }

    public function deleted(UserFavoriteApplication $favorite): void
    {
        DB::afterCommit(fn () => $this->publish('deleted', $favorite, $favorite->getAttributes(), null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, UserFavoriteApplication $favorite, ?array $previous, ?array $new): void
    {
        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType: self::ENTITY_TYPE,
            entityId: (string) $favorite->getKey(),
            action: $action,
            userId: (string) (Auth::id() ?? 'system'),
            previousValue: $previous,
            newValue: $new,
        );
    }
}
