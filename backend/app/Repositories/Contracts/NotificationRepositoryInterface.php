<?php

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
}
