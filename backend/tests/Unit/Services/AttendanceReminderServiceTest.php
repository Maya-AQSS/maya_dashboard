<?php

use App\DTOs\AttendanceDto;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\AttendanceServiceInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use App\Services\Notifications\AttendanceReminderService;
use Illuminate\Support\Str;

function makeReminderService(
    AttendanceServiceInterface $attendances,
    NotificationIngestionServiceInterface $ingestion,
    NotificationRepositoryInterface $repo,
): AttendanceReminderService {
    return new AttendanceReminderService($attendances, $ingestion, $repo);
}

beforeEach(function () {
    config(['messaging.app' => 'maya-dashboard']);
});

it('emits a reminder when the user has not clocked in today', function () {
    $userId = (string) Str::uuid();

    $attendances = Mockery::mock(AttendanceServiceInterface::class);
    $attendances->shouldReceive('listForUserOnDate')->once()->andReturn([]);

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('existsByMessageId')->once()->andReturn(false);

    $ingestion = Mockery::mock(NotificationIngestionServiceInterface::class);
    $ingestion->shouldReceive('ingest')->once()
        ->withArgs(function (array $payload, string $messageId) use ($userId) {
            return $payload['type'] === 'attendance.not_clocked_in'
                && $payload['recipient_keycloak_id'] === $userId
                && str_contains($messageId, 'attendance.not_clocked_in:'.$userId.':');
        })
        ->andReturn(true);

    expect(makeReminderService($attendances, $ingestion, $repo)->remindIfNotClockedIn($userId))->toBeTrue();
});

it('does not emit when the user already clocked in today', function () {
    $userId = (string) Str::uuid();

    $attendances = Mockery::mock(AttendanceServiceInterface::class);
    $attendances->shouldReceive('listForUserOnDate')->once()->andReturn(['already-checked-in']);

    $ingestion = Mockery::mock(NotificationIngestionServiceInterface::class);
    $ingestion->shouldReceive('ingest')->never();

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('existsByMessageId')->never();

    expect(makeReminderService($attendances, $ingestion, $repo)->remindIfNotClockedIn($userId))->toBeFalse();
});

it('is idempotent — does not emit twice the same day', function () {
    $userId = (string) Str::uuid();

    $attendances = Mockery::mock(AttendanceServiceInterface::class);
    $attendances->shouldReceive('listForUserOnDate')->once()->andReturn([]);

    $repo = Mockery::mock(NotificationRepositoryInterface::class);
    $repo->shouldReceive('existsByMessageId')->once()->andReturn(true); // already reminded

    $ingestion = Mockery::mock(NotificationIngestionServiceInterface::class);
    $ingestion->shouldReceive('ingest')->never();

    expect(makeReminderService($attendances, $ingestion, $repo)->remindIfNotClockedIn($userId))->toBeFalse();
});
