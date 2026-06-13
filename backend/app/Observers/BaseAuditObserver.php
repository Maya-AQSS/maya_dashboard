<?php

declare(strict_types=1);

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maya\Messaging\Publishers\AuditPublisher;

/**
 * Base CRUD audit Observer (events.md Caso A). Centraliza el patrón común de los
 * observers de auditoría del dashboard: publica created/updated/deleted vía
 * AuditPublisher tras el commit, atribuyendo al usuario autenticado (o 'system').
 * Las subclases solo declaran su entityType().
 */
abstract class BaseAuditObserver
{
    private const APPLICATION_SLUG = 'maya-dashboard';

    public function __construct(private readonly AuditPublisher $publisher) {}

    /**
     * Tipo de entidad auditada tal como aparece en el bus de mensajería.
     */
    abstract protected function entityType(): string;

    public function created(Model $model): void
    {
        DB::afterCommit(fn () => $this->publish('created', $model, null, $model->getAttributes()));
    }

    public function updated(Model $model): void
    {
        $previous = array_intersect_key($model->getOriginal(), $model->getChanges());
        DB::afterCommit(fn () => $this->publish('updated', $model, $previous, $model->getChanges()));
    }

    public function deleted(Model $model): void
    {
        DB::afterCommit(fn () => $this->publish('deleted', $model, $model->getAttributes(), null));
    }

    /**
     * @param  array<string, mixed>|null  $previous
     * @param  array<string, mixed>|null  $new
     */
    private function publish(string $action, Model $model, ?array $previous, ?array $new): void
    {
        $this->publisher->publish(
            applicationSlug: self::APPLICATION_SLUG,
            entityType: $this->entityType(),
            entityId: (string) $model->getKey(),
            action: $action,
            userId: (string) (Auth::id() ?? 'system'),
            previousValue: $previous,
            newValue: $new,
        );
    }
}
