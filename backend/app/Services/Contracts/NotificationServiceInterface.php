<?php

namespace App\Services\Contracts;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NotificationServiceInterface
{
    /**
     * @return LengthAwarePaginator<Notification>
     */
    public function paginate(
        string $recipientId,
        bool $unreadOnly,
        ?string $type,
        int $perPage,
    ): LengthAwarePaginator;

    public function markRead(string $recipientId, int $notificationId): Notification;

    public function markAllRead(string $recipientId): int;

    public function unreadCount(string $recipientId): int;
}
