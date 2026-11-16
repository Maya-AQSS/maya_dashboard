<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AttendanceDto;
use App\Services\Attendance\AttendanceWriteException;

interface AttendanceServiceInterface
{
    /**
     * @return list<AttendanceDto>
     */
    public function listForUserOnDate(string $userId, string $dateYmd): array;

    /**
     * Registra la entrada del usuario en Odoo con la hora de ahora (la pone Odoo). `source` es el
     * origen que se guarda como terminal del fichaje; por defecto, el del dashboard.
     *
     * @throws AttendanceWriteException si ya hay una entrada abierta hoy, el usuario no es empleado o
     *                                  Odoo no está disponible
     */
    public function clockIn(string $userId, ?string $source = null): AttendanceDto;

    /**
     * Registra la salida del usuario en Odoo con la hora de ahora y devuelve el tramo que cierra.
     *
     * @throws AttendanceWriteException si hoy no hay ninguna entrada abierta, el usuario no es
     *                                  empleado u Odoo no está disponible
     */
    public function clockOut(string $userId): AttendanceDto;
}
