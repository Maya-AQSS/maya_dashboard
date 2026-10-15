<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AttendanceDto;
use App\Services\Attendance\AttendanceWriteException;

/**
 * Escritura de fichajes en Odoo (D21): por el endpoint de maya_attendance, nunca por FDW.
 * La hora la pone Odoo al recibir la petición.
 */
interface AttendanceWriterInterface
{
    /**
     * Registra la entrada del usuario (`sub` de Keycloak = `res_users.oauth_uid`) y devuelve el tramo
     * abierto.
     *
     * @throws AttendanceWriteException
     */
    public function clockIn(string $userId, string $terminalId): AttendanceDto;

    /**
     * Registra la salida del usuario y devuelve el tramo que cierra (su entrada de hoy).
     *
     * @throws AttendanceWriteException
     */
    public function clockOut(string $userId, string $terminalId): AttendanceDto;
}
