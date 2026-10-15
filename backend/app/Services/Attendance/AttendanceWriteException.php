<?php

declare(strict_types=1);

namespace App\Services\Attendance;

use RuntimeException;
use Throwable;

/**
 * Odoo no registró el fichaje. `reason` es la clave de traducción (`attendance.<reason>`) y fija el
 * estado HTTP que devuelve el dashboard.
 */
final class AttendanceWriteException extends RuntimeException
{
    /** Ya hay una entrada abierta hoy. */
    public const ALREADY_CHECKED_IN = 'already_checked_in';

    /** Hoy no hay ninguna entrada abierta que cerrar. */
    public const NO_OPEN_CHECK_IN = 'no_open_check_in';

    /** El usuario no es un empleado activo en Odoo (o su `oauth_uid` no está). */
    public const EMPLOYEE_NOT_FOUND = 'employee_not_found';

    /** Odoo no responde, no está configurado o rechaza la petición del dashboard. */
    public const UNAVAILABLE = 'unavailable';

    private function __construct(
        public readonly string $reason,
        string $message,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function alreadyCheckedIn(): self
    {
        return new self(self::ALREADY_CHECKED_IN, 'Odoo: ya hay una entrada abierta hoy');
    }

    public static function noOpenCheckIn(): self
    {
        return new self(self::NO_OPEN_CHECK_IN, 'Odoo: no hay ninguna entrada abierta que cerrar');
    }

    public static function employeeNotFound(): self
    {
        return new self(self::EMPLOYEE_NOT_FOUND, 'Odoo: no hay ningún empleado con ese oauth_uid');
    }

    public static function unavailable(string $detail, ?Throwable $previous = null): self
    {
        return new self(self::UNAVAILABLE, 'Odoo: '.$detail, $previous);
    }

    public function httpStatus(): int
    {
        return match ($this->reason) {
            self::ALREADY_CHECKED_IN, self::NO_OPEN_CHECK_IN => 409,
            self::EMPLOYEE_NOT_FOUND => 422,
            default => 503,
        };
    }
}
