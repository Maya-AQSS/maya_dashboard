<?php

declare(strict_types=1);

namespace App\Services\Contracts;

interface AttendanceReminderServiceInterface
{
    /**
     * If the user has not clocked in today, emit a one-per-day reminder
     * notification (event type attendance.not_clocked_in). Idempotent.
     *
     * @return bool true if a reminder was emitted, false otherwise
     */
    public function remindIfNotClockedIn(string $userId): bool;
}
