<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\NotificationDto;
use App\Models\Notification;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notifications,
    ) {}

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
    ): PaginatedDto {
        $paginator = $this->notifications->paginateForRecipient(
            $recipientId, $unreadOnly, $type, $perPage,
            $app, $search, $dateFrom, $dateTo, $sortBy, $sortDir,
        );

        return PaginatedDto::fromPaginator(
            $paginator,
            fn (Notification $n): NotificationDto => NotificationDto::fromModel($n),
        );
    }

    public function find(string $recipientId, int $notificationId): NotificationDto
    {
        return NotificationDto::fromModel(
            $this->notifications->findForRecipientOrFail($recipientId, $notificationId),
        );
    }

    public function markRead(string $recipientId, int $notificationId): NotificationDto
    {
        return NotificationDto::fromModel($this->notifications->markRead(
            $this->notifications->findForRecipientOrFail($recipientId, $notificationId),
        ));
    }

    public function markAllRead(string $recipientId): int
    {
        return $this->notifications->markAllReadForRecipient($recipientId);
    }

    public function unreadCount(string $recipientId): int
    {
        return $this->notifications->unreadCountForRecipient($recipientId);
    }
}
