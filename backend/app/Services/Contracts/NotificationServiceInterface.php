<?php

declare(strict_types=1);

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
        ?string $app = null,
        ?string $search = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
    ): PaginatedDto;

    public function find(string $recipientId, int $notificationId): NotificationDto;

    public function markRead(string $recipientId, int $notificationId): NotificationDto;

    public function markAllRead(string $recipientId): int;

    public function unreadCount(string $recipientId): int;
}
