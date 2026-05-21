<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\AttendanceDto;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Support\Facades\DB;

/**
 * Lectura de la vista `attendances` — proyección FDW de `v_app_attendances`
 * en Odoo. Solo lectura: la vista no se escribe nunca desde el dashboard.
 */
final class AttendanceRepository implements AttendanceRepositoryInterface
{
    public function findForUserOnDate(string $userId, string $dateYmd): array
    {
        $rows = DB::table('attendances')
            ->select(['id', 'user_id', 'check_in', 'check_out', 'source'])
            ->where('user_id', $userId)
            ->whereRaw('CAST(check_in AS DATE) = ?', [$dateYmd])
            ->orderBy('check_in')
            ->get();

        return $rows->map(fn ($row): AttendanceDto => AttendanceDto::fromRow($row))->all();
    }
}
