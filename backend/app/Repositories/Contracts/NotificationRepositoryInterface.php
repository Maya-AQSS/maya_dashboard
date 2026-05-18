<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NotificationRepositoryInterface
{
    /**
     * Paginación de notificaciones para un destinatario, con filtros opcionales.
     *
     * @return LengthAwarePaginator<Notification>
     */
    public function paginateForRecipient(
        string $recipientId,
        bool $unreadOnly,
        ?string $type,
        int $perPage,
    ): LengthAwarePaginator;

    /**
     * Localiza una notificación del destinatario o lanza 404.
     */
    public function findForRecipientOrFail(string $recipientId, int $notificationId): Notification;

    /**
     * Marca como leída si todavía no lo estaba. Devuelve la instancia actualizada.
     */
    public function markRead(Notification $notification): Notification;

    /**
     * Marca como leídas todas las no leídas del destinatario. Devuelve cuántas filas se actualizaron.
     */
    public function markAllReadForRecipient(string $recipientId): int;

    public function unreadCountForRecipient(string $recipientId): int;

    /**
     * Idempotent ingest by AMQP message id. Returns the persisted (or
     * existing) notification row.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function upsertByMessageId(string $messageId, array $attributes): Notification;

    /**
     * @return bool true if the user exists in the federated users table.
     */
    public function userExists(string $keycloakId): bool;
}
