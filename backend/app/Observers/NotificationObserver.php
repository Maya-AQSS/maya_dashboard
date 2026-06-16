<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * CRUD audit Observer para Notification (events.md Caso A). Las notificaciones
 * son consumidas por usuarios; el audit captura la creación (system o app
 * publisher), marcado como leído, reconocimiento, resolución y borrado.
 *
 * Enriquece new_value con _context para que el auditor vea texto legible
 * (título resuelto, descripción de la acción, tipo, app, URL, nombre del
 * destinatario) en lugar de solo IDs y claves i18n crudas.
 */
final class NotificationObserver extends BaseAuditObserver
{
    protected function entityType(): string
    {
        return 'notification';
    }

    /**
     * @param  array<string, mixed>|null  $new
     * @return array<string, mixed>|null
     */
    protected function enrichNew(string $action, Model $model, ?array $new): ?array
    {
        if ($new === null) {
            return null;
        }

        return array_merge($new, ['_context' => $this->buildContext($action, $model, $new)]);
    }

    /**
     * @param  array<string, mixed>  $new
     * @return array<string, mixed>
     */
    private function buildContext(string $action, Model $model, array $new): array
    {
        $params = is_array($model->params) ? $model->params : [];
        $resolvedTitle = $this->resolveTitle($model, $params);
        $resolvedBody = $this->resolveBody($model, $params);
        $recipient = $this->resolveUser($model->recipient_id);

        return array_filter([
            'description' => $this->buildDescription($action, $model, $new, $resolvedTitle, $recipient),
            'notification_type' => $model->type,
            'notification_app' => $model->app,
            'resolved_title' => $resolvedTitle,
            'resolved_body' => $resolvedBody,
            'recipient' => $recipient,
            'url' => $model->url,
            'target_app' => $model->target_app,
            'severity' => $model->severity,
        ], fn ($v) => $v !== null && $v !== '');
    }

    private function resolveTitle(Model $model, array $params): ?string
    {
        if ($model->title !== null && $model->title !== '') {
            return $model->title;
        }

        if ($model->title_key !== null && $model->title_key !== '') {
            $translated = trans($model->title_key, $params, 'es');

            return ($translated !== $model->title_key) ? $translated : null;
        }

        return null;
    }

    private function resolveBody(Model $model, array $params): ?string
    {
        if ($model->body !== null && $model->body !== '') {
            return $model->body;
        }

        if ($model->body_key !== null && $model->body_key !== '') {
            $translated = trans($model->body_key, $params, 'es');

            return ($translated !== $model->body_key) ? $translated : null;
        }

        return null;
    }

    /**
     * Resuelve un Keycloak UUID a "Nombre Apellido (email)" o al UUID si no se
     * encuentra el usuario (p. ej. usuario desactivado o sistema).
     */
    private function resolveUser(?string $keycloakId): ?string
    {
        if ($keycloakId === null) {
            return null;
        }

        $user = User::find($keycloakId);

        if ($user === null) {
            return $keycloakId;
        }

        $name = trim((string) ($user->name ?? "{$user->first_name} {$user->last_name}"));

        if ($name !== '' && $user->email !== null) {
            return "{$name} ({$user->email})";
        }

        return $name !== '' ? $name : ($user->email ?? $keycloakId);
    }

    /**
     * @param  array<string, mixed>  $new
     */
    private function buildDescription(string $action, Model $model, array $new, ?string $resolvedTitle, ?string $recipient): string
    {
        $label = $resolvedTitle ?? $model->type ?? 'notificación';
        $actor = $this->resolveUser((string) (Auth::id() ?? '')) ?? 'sistema';
        $to = $recipient ?? $model->recipient_id ?? '—';

        return match (true) {
            $action === 'created' => "Notificación creada: '{$label}' para {$to}",
            $action === 'deleted' => "Notificación eliminada: '{$label}'",
            $action === 'updated' && array_key_exists('read_at', $new) => "Notificación '{$label}' marcada como leída por {$actor}",
            $action === 'updated' && array_key_exists('acknowledged_at', $new) => "Notificación '{$label}' reconocida por {$actor}",
            $action === 'updated' && array_key_exists('resolved_at', $new) => "Notificación '{$label}' resuelta por {$actor}",
            default => "Notificación '{$label}' actualizada por {$actor}",
        };
    }
}
