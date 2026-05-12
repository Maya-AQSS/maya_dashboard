<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notifications,
    ) {}

    public function paginate(
        string $recipientId,
        bool $unreadOnly,
        ?string $type,
        int $perPage,
    ): LengthAwarePaginator {
        return $this->notifications->paginateForRecipient($recipientId, $unreadOnly, $type, $perPage);
    }

    public function markRead(string $recipientId, int $notificationId): Notification
    {
        return $this->notifications->markRead(
            $this->notifications->findForRecipientOrFail($recipientId, $notificationId),
        );
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
