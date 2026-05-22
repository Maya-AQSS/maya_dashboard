<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Concede UPDATE en `attendances_fdw` al usuario de aplicación de PostgreSQL.
 *
 * El widget de fichajes del dashboard permite cerrar el check-in abierto del
 * día con un botón "Fichar salida", que el controlador resuelve con un
 * UPDATE check_out=now() sobre la foreign table. La utilidad compartida
 * `PostgresFdwMigration::createForeignTableWithPassThroughView` revoca por
 * defecto INSERT/UPDATE/DELETE — necesitamos el GRANT explícito.
 *
 * La actualización atraviesa el FDW hasta `v_app_attendances` en Odoo, donde
 * un trigger INSTEAD OF UPDATE redirige el cambio a la tabla mock
 * `dev_attendance` (ver `seed-bookings-attendances.sh`). Cuando exista el
 * módulo Odoo real, el trigger se redirigirá a su tabla.
 *
 * Solo aplica fuera de testing: en testing `attendances` es una tabla local
 * sin restricciones.
 */
return new class extends Migration
{
    private const FDW_TABLE = 'attendances_fdw';

    private function isTestEnv(): bool
    {
        if (app()->environment('testing')) {
            return true;
        }
        $db = config('database.connections.pgsql.database');

        return is_string($db) && str_ends_with($db, '_test');
    }

    public function up(): void
    {
        if ($this->isTestEnv()) {
            return;
        }
        $appUser = config('database.connections.pgsql.username');
        if (! is_string($appUser) || $appUser === '') {
            return;
        }

        try {
            DB::statement('GRANT UPDATE ON '.self::FDW_TABLE.' TO "'.$appUser.'"');
        } catch (\Throwable $e) {
            logger()->warning('FDW: could not GRANT UPDATE on '.self::FDW_TABLE.': '.$e->getMessage());
        }
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            return;
        }
        $appUser = config('database.connections.pgsql.username');
        if (! is_string($appUser) || $appUser === '') {
            return;
        }

        try {
            DB::statement('REVOKE UPDATE ON '.self::FDW_TABLE.' FROM "'.$appUser.'"');
        } catch (\Throwable $e) {
            logger()->warning('FDW: could not REVOKE UPDATE on '.self::FDW_TABLE.': '.$e->getMessage());
        }
    }
};
