<?php

declare(strict_types=1);

namespace App\Services\Attendance;

use App\DTOs\AttendanceDto;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Services\Contracts\AttendanceServiceInterface;
use App\Services\Contracts\AttendanceWriterInterface;

/**
 * Fichajes del usuario: lectura por FDW (vista `attendances`) y escritura por el endpoint de Odoo
 * (D21: a Odoo nunca se escribe por FDW).
 */
final class AttendanceService implements AttendanceServiceInterface
{
    public function __construct(
        private readonly AttendanceRepositoryInterface $attendances,
        private readonly AttendanceWriterInterface $writer,
        private readonly string $defaultTerminalId = 'dashboard',
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
        return $this->writer->clockIn($userId, $source ?? $this->defaultTerminalId);
    }

    public function clockOut(string $userId): AttendanceDto
    {
        return $this->writer->clockOut($userId, $this->defaultTerminalId);
    }
}
