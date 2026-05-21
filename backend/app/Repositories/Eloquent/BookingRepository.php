<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\BookingDto;
use App\Repositories\Contracts\BookingRepositoryInterface;
use Illuminate\Support\Facades\DB;

/**
 * Lectura de la vista `bookings` — proyección FDW de `v_app_bookings`
 * en Odoo. Solo lectura.
 */
final class BookingRepository implements BookingRepositoryInterface
{
    public function findForUserInRange(string $userId, string $fromYmd, string $toYmd): array
    {
        $rangeStart = $fromYmd.' 00:00:00';
        $rangeEnd = $toYmd.' 23:59:59';

        $rows = DB::table('bookings')
            ->select([
                'id', 'user_id', 'title', 'resource_id', 'resource_name',
                'start_at', 'end_at', 'all_day', 'status',
            ])
            ->where('user_id', $userId)
            // Solapamiento: la reserva empieza antes de rangeEnd y termina después de rangeStart.
            ->where('start_at', '<=', $rangeEnd)
            ->where('end_at', '>=', $rangeStart)
            ->orderBy('start_at')
            ->get();

        return $rows->map(fn ($row): BookingDto => BookingDto::fromRow($row))->all();
    }
}
