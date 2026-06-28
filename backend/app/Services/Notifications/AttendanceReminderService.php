<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\AttendanceReminderServiceInterface;
use App\Services\Contracts\AttendanceServiceInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;

/**
 * Event-driven "you haven't clocked in today" reminder. Triggered on login
 * (frontend calls the endpoint). Re-checks attendance server-side and emits at
 * most one reminder per user per day (deterministic message_id → idempotent).
 *
 * The notification type `attendance.not_clocked_in` is a normal `event`
 * definition: toggleable from the dashboard "System notifications" tab.
 */
final class AttendanceReminderService implements AttendanceReminderServiceInterface
{
    private const TYPE = 'attendance.not_clocked_in';

    public function __construct(
        private readonly AttendanceServiceInterface $attendances,
        private readonly NotificationIngestionServiceInterface $ingestion,
        private readonly NotificationRepositoryInterface $notifications,
    ) {}

    public function remindIfNotClockedIn(string $userId): bool
    {
        $today = now()->format('Y-m-d');

        // Already clocked in today → nothing to remind.
        if ($this->attendances->listForUserOnDate($userId, $today) !== []) {
            return false;
        }

        $messageId = self::TYPE.':'.$userId.':'.$today;

        // Already reminded today → skip (avoids re-broadcast on repeated calls).
        if ($this->notifications->existsByMessageId($messageId)) {
            return false;
        }

        // Goes through the standard ingestion: enabled-gate, definition defaults
        // (severity/url/i18n keys), persistence and real-time broadcast.
        return $this->ingestion->ingest([
            'app' => (string) config('messaging.app'),
            'type' => self::TYPE,
            'recipient_keycloak_id' => $userId,
            'channels' => ['app'],
            'scope' => 'user',
            'params' => (object) [],
        ], $messageId);
    }
}
