<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Services\Contracts\AttendanceReminderServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Maya\Http\Concerns\RespondsWithEnvelope;

/**
 * Login-triggered check: the frontend calls this once after authentication; if
 * the user hasn't clocked in today, a one-per-day reminder notification is
 * emitted (event type attendance.not_clocked_in).
 */
class AttendanceReminderController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly AttendanceReminderServiceInterface $reminder,
    ) {}

    public function check(Request $request): JsonResponse
    {
        $userId = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(['reminded' => $this->reminder->remindIfNotClockedIn($userId)]);
    }
}
