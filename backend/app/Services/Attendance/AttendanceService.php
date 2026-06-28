<?php

declare(strict_types=1);

namespace App\Services\Attendance;

use App\DTOs\AttendanceDto;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Services\Contracts\AttendanceServiceInterface;

final class AttendanceService implements AttendanceServiceInterface
{
    public function __construct(
        private readonly AttendanceRepositoryInterface $attendances,
    ) {}

    /**
     * @return list<AttendanceDto>
     */
    public function listForUserOnDate(string $userId, string $dateYmd): array
    {
        return $this->attendances->findForUserOnDate($userId, $dateYmd);
    }

    public function clockIn(string $userId, ?string $source = null): AttendanceDto
    {
        return $this->attendances->createCheckIn($userId, $source);
    }

    public function clockOut(string $userId): ?AttendanceDto
    {
        return $this->attendances->closeOpenAttendance($userId);
    }
}
