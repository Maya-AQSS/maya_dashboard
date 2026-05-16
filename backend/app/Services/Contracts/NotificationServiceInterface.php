<?php

namespace App\Services\Contracts;

use App\DTOs\NotificationDto;
use Maya\Http\Pagination\PaginatedDto;

interface NotificationServiceInterface
{
    /**
     * @return PaginatedDto<NotificationDto>
     */
    public function paginate(
        string $recipientId,
        bool $unreadOnly,
        ?string $type,
        int $perPage,
    ): PaginatedDto;

    public function markRead(string $recipientId, int $notificationId): NotificationDto;

    public function markAllRead(string $recipientId): int;

    public function unreadCount(string $recipientId): int;
}
