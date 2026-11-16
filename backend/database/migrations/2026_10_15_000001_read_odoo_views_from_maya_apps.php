<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Las tablas foráneas propias del dashboard leen vistas del esquema `maya_apps` de `maya_erp` (D17).
 *
 * Las vistas son del dashboard (database/views/*.sql) y las crea su despliegue con
 * `php artisan maya:views` (Job `views` del chart), con el rol `maya_apps_views`; `maya_fdw_reader`
 * solo lee ese esquema. Las vistas locales no cambian:
 *
 *   employee_profiles_fdw → maya_apps.v_app_employee_profile
 *   attendances_fdw       → maya_apps.v_app_attendances  (maya_attendance: D21)
 *   bookings_fdw          → maya_apps.v_app_bookings     (D27: no existe en producción hasta que haya
 *                                                         maya_booking; el widget está detrás del permiso
 *                                                         dashboard.bookings)
 *
 * D21: a Odoo solo se escribe por sus endpoints. `v_app_attendances` es de solo lectura (tramos
 * calculados a partir de las marcas de maya_attendance) y el usuario de la app pierde el INSERT y el
 * UPDATE que le daba 2026_05_22_000001 sobre `attendances_fdw`.
 *
 * - `testing` / BD `*_test`: no-op (tablas físicas).
 * - resto: `ALTER FOREIGN TABLE … OPTIONS (SET schema_name, SET table_name)` (si la tabla existe).
 */
return new class extends Migration
{
    /** tabla foránea => vista (el mismo nombre en public antes y en maya_apps ahora) */
    private const FOREIGN_TABLES = [
        'employee_profiles_fdw' => 'v_app_employee_profile',
        'attendances_fdw' => 'v_app_attendances',
        'bookings_fdw' => 'v_app_bookings',
    ];

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

        $this->repoint('maya_apps');

        // D21: solo lectura por FDW
        $this->grantOnAttendances('REVOKE INSERT, UPDATE, DELETE ON attendances_fdw FROM');
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            return;
        }

        $this->repoint('public');
        $this->grantOnAttendances('GRANT INSERT, UPDATE ON attendances_fdw TO');
    }

    private function repoint(string $schema): void
    {
        foreach (self::FOREIGN_TABLES as $table => $view) {
            DB::statement("ALTER FOREIGN TABLE IF EXISTS {$table} OPTIONS (SET schema_name '{$schema}', SET table_name '{$view}')");
        }
    }

    private function grantOnAttendances(string $statement): void
    {
        $appUser = config('database.connections.pgsql.username');
        if (! is_string($appUser) || $appUser === '') {
            return;
        }

        $exists = DB::selectOne("SELECT to_regclass('attendances_fdw') IS NOT NULL AS present");
        if ($exists === null || ! $exists->present) {
            return;
        }

        DB::statement($statement.' "'.str_replace('"', '""', $appUser).'"');
    }
};
