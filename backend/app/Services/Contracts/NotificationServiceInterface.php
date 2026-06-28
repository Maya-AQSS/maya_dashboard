<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\NotificationDto;
use App\DTOs\NotificationFilterDto;
use Maya\Http\Pagination\PaginatedDto;

interface NotificationServiceInterface
{
    /**
     * @return PaginatedDto<NotificationDto>
     */
    public function paginate(string $recipientId, NotificationFilterDto $filter): PaginatedDto;

    public function find(string $recipientId, int $notificationId): NotificationDto;

    public function markRead(string $recipientId, int $notificationId): NotificationDto;

    public function markAllRead(string $recipientId): int;

    public function unreadCount(string $recipientId): int;

    public function delete(string $recipientId, int $notificationId): void;
}
