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

    /**
     * Inserta un check-in con timestamp = ahora y devuelve la fila como DTO.
     * `source` indica el origen ('manual', 'kiosk', etc.); por defecto 'manual'.
     */
    public function createCheckIn(string $userId, ?string $source = null): AttendanceDto;

    /**
     * Cierra la última asistencia abierta del usuario (check_out IS NULL)
     * actualizando check_out = ahora. Devuelve el DTO actualizado o `null`
     * si no había ninguna fila abierta.
     */
    public function closeOpenAttendance(string $userId): ?AttendanceDto;
}
