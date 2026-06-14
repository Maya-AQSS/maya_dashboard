<?php

declare(strict_types=1);

namespace App\DTOs;

use Illuminate\Database\Eloquent\Model;

/**
 * Reserva proyectada desde la vista FDW `bookings` (`v_app_bookings` en Odoo).
 */
final readonly class BookingDto
{
    public function __construct(
        public string $id,
        public string $userId,
        public string $title,
        public ?string $resourceId,
        public ?string $resourceName,
        public string $startAt,
        public string $endAt,
        public bool $allDay,
        public string $status,
    ) {}

    /**
     * @param  array<string, mixed>|object  $row
     */
    public static function fromRow(array|object $row): self
    {
        // Un modelo Eloquent guarda los datos en `$attributes` (protegido):
        // get_object_vars() desde este scope solo vería flags públicos (exists,
        // incrementing, …) y dejaría todos los campos vacíos. Usar
        // attributesToArray() (con casts). stdClass (filas crudas FDW) sigue
        // por get_object_vars().
        if ($row instanceof Model) {
            $row = $row->attributesToArray();
        } elseif (is_object($row)) {
            $row = get_object_vars($row);
        }

        return new self(
            id: (string) ($row['id'] ?? ''),
            userId: (string) ($row['user_id'] ?? ''),
            title: (string) ($row['title'] ?? ''),
            resourceId: isset($row['resource_id']) ? (string) $row['resource_id'] : null,
            resourceName: isset($row['resource_name']) ? (string) $row['resource_name'] : null,
            startAt: self::toIso($row['start_at'] ?? null) ?? '',
            endAt: self::toIso($row['end_at'] ?? null) ?? '',
            allDay: (bool) ($row['all_day'] ?? false),
            status: (string) ($row['status'] ?? 'confirmed'),
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

        try {
            return (new \DateTimeImmutable((string) $value))->format(\DateTimeInterface::ATOM);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException(
                sprintf('BookingDto: invalid datetime value "%s": %s', $value, $e->getMessage()),
                0,
                $e,
            );
        }
    }
}
