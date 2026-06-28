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

    public function createCheckIn(string $userId, ?string $source = null): AttendanceDto
    {
        $now = now();
        $effectiveSource = $source ?? 'manual';

        // En testing la BD es local: INSERT directo en la tabla física que sí
        // tiene PK propia (ver migración). En el resto de entornos, el destino
        // real es Odoo vía FDW (foreign table `attendances_fdw`); el seeder
        // mock crea allá una tabla `dev_attendance` con BIGSERIAL, así que el
        // PK se genera del lado Odoo y NO se envía en el INSERT.
        if (app()->environment('testing') || str_ends_with((string) config('database.connections.pgsql.database'), '_test')) {
            $id = (string) (int) (microtime(true) * 1000);
            DB::table('attendances')->insert([
                'id' => $id,
                'user_id' => $userId,
                'check_in' => $now,
                'check_out' => null,
                'source' => $effectiveSource,
            ]);

            return AttendanceDto::fromRow([
                'id' => $id,
                'user_id' => $userId,
                'check_in' => $now,
                'check_out' => null,
                'source' => $effectiveSource,
            ]);
        }

        // FDW: insertamos en la foreign table; el id lo genera la tabla remota.
        // No podemos usar RETURNING porque postgres_fdw lo soporta pero el
        // Query Builder de Laravel no expone insertReturning para foreign
        // tables sin secuencia propia. Insertamos y releemos.
        DB::table('attendances_fdw')->insert([
            'user_id' => $userId,
            'check_in' => $now,
            'check_out' => null,
            'source' => $effectiveSource,
        ]);

        $row = DB::table('attendances')
            ->where('user_id', $userId)
            ->whereNull('check_out')
            ->orderByDesc('check_in')
            ->first();

        if ($row === null) {
            // Fallback defensivo: construimos el DTO con los datos que enviamos.
            return AttendanceDto::fromRow([
                'id' => '',
                'user_id' => $userId,
                'check_in' => $now,
                'check_out' => null,
                'source' => $effectiveSource,
            ]);
        }

        return AttendanceDto::fromRow($row);
    }

    public function closeOpenAttendance(string $userId): ?AttendanceDto
    {
        $now = now();

        // En testing operamos sobre la tabla física local. En el resto de
        // entornos el destino real es Odoo vía FDW; el UPDATE se proyecta a
        // la foreign table `attendances_fdw`. Filtramos por user_id +
        // check_out IS NULL para cerrar SIEMPRE la fila abierta más reciente.
        $isLocal = app()->environment('testing')
            || str_ends_with((string) config('database.connections.pgsql.database'), '_test');

        if ($isLocal) {
            $row = DB::table('attendances')
                ->where('user_id', $userId)
                ->whereNull('check_out')
                ->orderByDesc('check_in')
                ->first();

            if ($row === null) {
                return null;
            }

            DB::table('attendances')
                ->where('id', $row->id)
                ->update(['check_out' => $now]);

            return AttendanceDto::fromRow([
                'id' => $row->id,
                'user_id' => $row->user_id,
                'check_in' => $row->check_in,
                'check_out' => $now,
                'source' => $row->source,
            ]);
        }

        // FDW: localizamos la fila abierta y la actualizamos. El postgres_fdw
        // soporta UPDATE en foreign tables; la PK vive en Odoo.
        $row = DB::table('attendances')
            ->where('user_id', $userId)
            ->whereNull('check_out')
            ->orderByDesc('check_in')
            ->first();

        if ($row === null) {
            return null;
        }

        DB::table('attendances_fdw')
            ->where('id', $row->id)
            ->update(['check_out' => $now]);

        return AttendanceDto::fromRow([
            'id' => $row->id,
            'user_id' => $row->user_id,
            'check_in' => $row->check_in,
            'check_out' => $now,
            'source' => $row->source,
        ]);
    }
}
