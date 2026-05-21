<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Concede INSERT en `attendances_fdw` al usuario de aplicación de PostgreSQL.
 *
 * La utilidad compartida `PostgresFdwMigration::createForeignTableWithPassThroughView`
 * revoca por defecto INSERT/UPDATE/DELETE sobre la foreign table — esto es lo
 * correcto para vistas de solo lectura (users, teams, …). Para `attendances`
 * el dashboard necesita registrar un check-in vía el botón "Fichar" del widget
 * de alertas, así que re-concedemos INSERT explícitamente.
 *
 * El user mapping del FDW usa el usuario `maya` (owner remoto en Odoo), así
 * que la inserción atraviesa el FDW y termina en `dev_attendance` (o la tabla
 * real cuando el módulo Odoo definitivo aterrice).
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
            DB::statement('GRANT INSERT ON '.self::FDW_TABLE.' TO "'.$appUser.'"');
        } catch (\Throwable $e) {
            logger()->warning('FDW: could not GRANT INSERT on '.self::FDW_TABLE.': '.$e->getMessage());
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
            DB::statement('REVOKE INSERT ON '.self::FDW_TABLE.' FROM "'.$appUser.'"');
        } catch (\Throwable $e) {
            logger()->warning('FDW: could not REVOKE INSERT on '.self::FDW_TABLE.': '.$e->getMessage());
        }
    }
};
