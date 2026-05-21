<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AttendanceDto;

interface AttendanceServiceInterface
{
    /**
     * @return list<AttendanceDto>
     */
    public function listForUserOnDate(string $userId, string $dateYmd): array;
}
