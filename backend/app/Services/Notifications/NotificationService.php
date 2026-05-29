<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\NotificationDto;
use App\DTOs\NotificationFilterDto;
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
    public function paginate(string $recipientId, NotificationFilterDto $filter): PaginatedDto
    {
        $paginator = $this->notifications->paginateForRecipient($recipientId, $filter);

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

    public function acknowledge(string $recipientId, int $notificationId, string $userId): NotificationDto
    {
        return NotificationDto::fromModel($this->notifications->acknowledge(
            $this->notifications->findForRecipientOrFail($recipientId, $notificationId),
            $userId,
        ));
    }

    public function resolve(string $recipientId, int $notificationId, string $userId): NotificationDto
    {
        return NotificationDto::fromModel($this->notifications->resolve(
            $this->notifications->findForRecipientOrFail($recipientId, $notificationId),
            $userId,
        ));
    }
}
