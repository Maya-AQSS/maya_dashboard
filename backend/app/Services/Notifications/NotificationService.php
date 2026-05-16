<?php
declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\NotificationDto;
use Maya\Http\Pagination\PaginatedDto;
use App\Models\Notification;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationServiceInterface;

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
    ): PaginatedDto {
        $paginator = $this->notifications->paginateForRecipient($recipientId, $unreadOnly, $type, $perPage);

        return PaginatedDto::fromPaginator(
            $paginator,
            fn (Notification $n): NotificationDto => NotificationDto::fromModel($n),
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
