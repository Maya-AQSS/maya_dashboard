<?php

declare(strict_types=1);

namespace App\DTOs;

/**
 * Evento de fichaje (clock-in/out) proyectado desde la vista FDW `attendances`.
 *
 * `checkOut` es null mientras el fichaje sigue abierto. Las fechas se
 * normalizan a ISO 8601 en el momento del mapeo desde la fila SQL.
 */
final readonly class AttendanceDto
{
    public function __construct(
        public string $id,
        public string $userId,
        public string $checkIn,
        public ?string $checkOut,
        public ?string $source,
    ) {}

    /**
     * @param  array<string, mixed>|object  $row
     */
    public static function fromRow(array|object $row): self
    {
        $row = is_object($row) ? get_object_vars($row) : $row;

        return new self(
            id: (string) ($row['id'] ?? ''),
            userId: (string) ($row['user_id'] ?? ''),
            checkIn: self::toIso($row['check_in'] ?? null) ?? '',
            checkOut: self::toIso($row['check_out'] ?? null),
            source: isset($row['source']) ? (string) $row['source'] : null,
        );
    }

    private static function toIso(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if ($value instanceof \DateTimeInterface) {
            return $value->format(\DateTimeInterface::ATOM);
        }

        return (new \DateTimeImmutable((string) $value))->format(\DateTimeInterface::ATOM);
    }
}
