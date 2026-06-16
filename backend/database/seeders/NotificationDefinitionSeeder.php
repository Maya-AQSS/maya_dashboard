<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NotificationDefinition;
use Illuminate\Database\Seeder;

/**
 * Catalog of every system notification type. The single source of truth for the
 * on/off toggle (enforced at ingestion), severity, i18n keys and click-through URL.
 *
 * i18n convention: title_key = notifications.<key>.title, body_key = notifications.<key>.body
 * (see lang/{es,va,en}/notifications.php).
 */
class NotificationDefinitionSeeder extends Seeder
{
    /**
     * Frontend que sirve el recurso de cada servicio emisor (token de peerOrigin).
     * Los recursos de authorization (roles/permisos) se ven en el PERFIL, que vive
     * en el propio dashboard.
     */
    private const TARGET_APP_BY_SOURCE = [
        'maya-authorization' => 'dashboard',
        'maya-dms' => 'dms',
        'maya-logs' => 'logs',
        'maya-dashboard' => 'dashboard',
    ];

    public function run(): void
    {
        foreach ($this->definitions() as $def) {
            NotificationDefinition::updateOrCreate(
                ['key' => $def['key']],
                [
                    'source_app' => $def['source_app'],
                    'category' => $def['category'],
                    'label' => $def['label'],
                    'description' => $def['description'] ?? null,
                    'enabled' => $def['enabled'] ?? true,
                    'default_severity' => $def['default_severity'] ?? 'info',
                    'title_key' => 'notifications.'.$def['key'].'.title',
                    'body_key' => 'notifications.'.$def['key'].'.body',
                    'url_template' => $def['url_template'] ?? null,
                    'target_app' => $def['target_app'] ?? self::TARGET_APP_BY_SOURCE[$def['source_app']] ?? null,
                    'schedule_cron' => $def['schedule_cron'] ?? null,
                ],
            );
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function definitions(): array
    {
        return [
            // ── maya-authorization (event) ───────────────────────────────
            ['key' => 'permissions.changed', 'source_app' => 'maya-authorization', 'category' => 'event', 'label' => 'Permisos del usuario modificados', 'default_severity' => 'medium', 'url_template' => '/profile'],
            ['key' => 'role.assigned', 'source_app' => 'maya-authorization', 'category' => 'event', 'label' => 'Rol asignado', 'default_severity' => 'info', 'url_template' => '/profile'],
            ['key' => 'role.revoked', 'source_app' => 'maya-authorization', 'category' => 'event', 'label' => 'Rol revocado', 'default_severity' => 'medium', 'url_template' => '/profile'],
            ['key' => 'permission.override_set', 'source_app' => 'maya-authorization', 'category' => 'event', 'label' => 'Permiso concedido (override)', 'default_severity' => 'medium', 'url_template' => '/profile'],
            ['key' => 'permission.override_removed', 'source_app' => 'maya-authorization', 'category' => 'event', 'label' => 'Override de permiso eliminado', 'default_severity' => 'medium', 'url_template' => '/profile'],
            ['key' => 'role.permissions.changed', 'source_app' => 'maya-authorization', 'category' => 'event', 'label' => 'Permisos de un rol modificados', 'default_severity' => 'medium', 'url_template' => '/profile'],

            // ── maya-dms (event) ─────────────────────────────────────────
            ['key' => 'document.validation_requested', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Solicitud de validación de documento', 'default_severity' => 'high', 'url_template' => '/documents/{document_id}'],
            ['key' => 'document.published', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Documento publicado', 'default_severity' => 'info', 'url_template' => '/documents/{document_id}'],
            ['key' => 'document.rejected', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Documento rechazado', 'default_severity' => 'high', 'url_template' => '/documents/{document_id}'],
            ['key' => 'template.validation_requested', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Solicitud de validación de plantilla', 'default_severity' => 'high', 'url_template' => '/templates/{template_id}'],
            ['key' => 'template.rejected', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Plantilla rechazada', 'default_severity' => 'high', 'url_template' => '/templates/{template_id}'],
            ['key' => 'template.published', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Plantilla publicada', 'default_severity' => 'info', 'url_template' => '/templates/{template_id}'],
            ['key' => 'template.version.affects_my_document', 'source_app' => 'maya-dms', 'category' => 'event', 'label' => 'Nueva versión de plantilla afecta a tu documento', 'default_severity' => 'medium', 'url_template' => '/documents/{document_id}'],

            // ── maya-logs (event) ────────────────────────────────────────
            ['key' => 'log.comment_added', 'source_app' => 'maya-logs', 'category' => 'event', 'label' => 'Comentario añadido a un log', 'default_severity' => 'info', 'url_template' => '/logs/{log_id}'],

            // ── dashboard (event, login-triggered) ───────────────────────
            ['key' => 'attendance.not_clocked_in', 'source_app' => 'maya-dashboard', 'category' => 'event', 'label' => 'Recordatorio de fichaje', 'description' => 'Al iniciar sesión, si el usuario no ha fichado hoy.', 'default_severity' => 'medium', 'url_template' => '/'],

            // ── scheduled rules (owner service evaluates) ────────────────
            ['key' => 'dms.validation_deadline_approaching', 'source_app' => 'maya-dms', 'category' => 'scheduled', 'label' => 'Fecha límite de validación próxima', 'description' => 'Documentos cuya fecha de validación final vence en menos de una semana.', 'default_severity' => 'high', 'url_template' => '/documents/{document_id}', 'schedule_cron' => '0 7 * * *'],
            ['key' => 'dms.pending_validations_threshold', 'source_app' => 'maya-dms', 'category' => 'scheduled', 'label' => 'Demasiados documentos por validar', 'description' => 'Usuarios con más de N documentos pendientes de validar.', 'default_severity' => 'medium', 'url_template' => '/documents', 'schedule_cron' => '0 7 * * *'],
            ['key' => 'logs.error_spike', 'source_app' => 'maya-logs', 'category' => 'scheduled', 'label' => 'Pico de errores críticos', 'description' => 'Reemplaza la antigua alert_rule de salud (>N logs críticos en una ventana).', 'default_severity' => 'critical', 'url_template' => '/logs', 'schedule_cron' => '* * * * *'],

            // ── generic condition engine ─────────────────────────────────
            ['key' => 'dms.generic_condition', 'source_app' => 'maya-dms', 'category' => 'scheduled', 'label' => 'Condición genérica (DMS)', 'description' => 'Regla configurable mediante condiciones de campo. Define las condiciones en el campo "Condiciones" de la regla.', 'default_severity' => 'medium', 'schedule_cron' => '0 7 * * *'],
        ];
    }
}
