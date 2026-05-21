<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\DTOs\AttendanceDto;

interface AttendanceRepositoryInterface
{
    /**
     * Devuelve los fichajes de `userId` en el día `dateYmd` (formato Y-m-d),
     * ordenados ascendentemente por check_in.
     *
     * @return list<AttendanceDto>
     */
    public function findForUserOnDate(string $userId, string $dateYmd): array;
}
