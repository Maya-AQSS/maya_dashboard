<?php
declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Notification;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class NotificationRepository implements NotificationRepositoryInterface
{
    public function paginateForRecipient(
        string $recipientId,
        bool $unreadOnly,
        ?string $type,
        int $perPage,
    ): LengthAwarePaginator {
        $query = Notification::forRecipient($recipientId)->orderByDesc('created_at');

        if ($unreadOnly) {
            $query->unread();
        }

        if ($type !== null && $type !== '') {
            $query->where('type', $type);
        }

        return $query->paginate($perPage);
    }

    public function findForRecipientOrFail(string $recipientId, int $notificationId): Notification
    {
        return Notification::forRecipient($recipientId)->findOrFail($notificationId);
    }

    public function markRead(Notification $notification): Notification
    {
        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return $notification->refresh();
    }

    public function markAllReadForRecipient(string $recipientId): int
    {
        return Notification::forRecipient($recipientId)
            ->unread()
            ->update(['read_at' => now()]);
    }

    public function unreadCountForRecipient(string $recipientId): int
    {
        return Notification::forRecipient($recipientId)->unread()->count();
    }

    public function upsertByMessageId(string $messageId, array $attributes): Notification
    {
        return Notification::updateOrCreate(['message_id' => $messageId], $attributes);
    }

    public function userExists(string $keycloakId): bool
    {
        return User::query()->where('id', $keycloakId)->exists();
    }
}
