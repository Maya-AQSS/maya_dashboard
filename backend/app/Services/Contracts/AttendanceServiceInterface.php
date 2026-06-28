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

    /**
     * Registra un check-in para el usuario con timestamp = ahora.
     */
    public function clockIn(string $userId, ?string $source = null): AttendanceDto;

    /**
     * Cierra el check-in abierto del usuario actualizando check_out = ahora.
     * Devuelve `null` si no había ningún check-in abierto.
     */
    public function clockOut(string $userId): ?AttendanceDto;
}
