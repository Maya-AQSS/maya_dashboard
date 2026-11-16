<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\DTOs\AttendanceDto;

/**
 * Lectura de fichajes (vista FDW `attendances`). La escritura no pasa por aquí: va al endpoint de
 * Odoo (D21, AttendanceWriterInterface).
 */
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
