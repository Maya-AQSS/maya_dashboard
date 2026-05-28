<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\NotificationFilterDto;
use App\Models\Notification;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class NotificationRepository implements NotificationRepositoryInterface
{
    public function paginateForRecipient(string $recipientId, NotificationFilterDto $filter): LengthAwarePaginator
    {
        $allowedSortColumns = ['created_at', 'read_at'];
        $column = in_array($filter->sortBy, $allowedSortColumns, true) ? $filter->sortBy : 'created_at';
        $direction = $filter->sortDir === 'asc' ? 'asc' : 'desc';

        $query = Notification::forRecipient($recipientId)->orderBy($column, $direction);

        if ($filter->unreadOnly) {
            $query->unread();
        }

        if ($filter->type !== null && $filter->type !== '') {
            $query->where('type', $filter->type);
        }

        if ($filter->app !== null && $filter->app !== '') {
            $query->where('app', $filter->app);
        }

        if ($filter->search !== null && $filter->search !== '') {
            $query->where(function ($q) use ($filter): void {
                $q->whereRaw('title ilike ?', ['%' . $filter->search . '%'])
                  ->orWhereRaw('body ilike ?', ['%' . $filter->search . '%']);
            });
        }

        if ($filter->dateFrom !== null) {
            $query->where('created_at', '>=', $filter->dateFrom);
        }

        if ($filter->dateTo !== null) {
            $query->where('created_at', '<=', $filter->dateTo . ' 23:59:59');
        }

        return $query->paginate($filter->perPage, page: $filter->page);
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
