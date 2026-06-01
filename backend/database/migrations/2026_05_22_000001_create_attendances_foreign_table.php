<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Maya\Platform\Database\PostgresFdwMigration;

/**
 * Vista local `attendances` proyectada desde `odoo.public.v_app_attendances`
 * vía postgres_fdw.
 *
 * Fuente de verdad: módulo Odoo de fichajes (read-only). El dashboard solo lee
 * — nunca escribe — el listado de eventos clock-in/out del empleado.
 *
 * Rutas:
 * - `testing`:                  tabla física `attendances` (factories pueden insertar).
 * - `local|staging|production`: FDW + vista pass-through hacia `odoo.public.v_app_attendances`.
 *
 * Columnas expuestas en la vista local `attendances`:
 *   id        — PK del evento (varchar)
 *   user_id   — UUID Keycloak del empleado (varchar 255)
 *   check_in  — timestamp de entrada
 *   check_out — timestamp de salida (nullable mientras fichaje abierto)
 *   source    — origen ('manual', 'kiosk', 'mobile', 'auto', …)
 */
return new class extends Migration
{
    private const VIEW_NAME = 'attendances';

    private const FDW_TABLE = 'attendances_fdw';

    private const FDW_SERVER = 'odoo_attendances_server';

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
            $this->createTestingTable();

            return;
        }

        $this->setupFdw();
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            DB::statement('DROP TABLE IF EXISTS '.self::VIEW_NAME);

            return;
        }

        PostgresFdwMigration::dropViewOrTableInPublic(self::VIEW_NAME);
        PostgresFdwMigration::dropForeignTableIfExists(self::FDW_TABLE);
        PostgresFdwMigration::dropFdwServerAndUserMapping(self::FDW_SERVER);
    }

    private function createTestingTable(): void
    {
        DB::statement('
            CREATE TABLE IF NOT EXISTS attendances (
                id         VARCHAR(64) PRIMARY KEY,
                user_id    VARCHAR(255) NOT NULL,
                check_in   TIMESTAMP NOT NULL,
                check_out  TIMESTAMP NULL,
                source     VARCHAR(64) NULL
            )
        ');
        DB::statement('CREATE INDEX IF NOT EXISTS attendances_user_id_idx ON attendances (user_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS attendances_check_in_idx ON attendances (check_in)');
    }

    private function setupFdw(): void
    {
        $host = (string) config('database.fdw.attendances.host', env('DB_HOST', 'maya_infra_postgres'));
        $port = (string) config('database.fdw.attendances.port', '5432');
        $database = (string) config('database.fdw.attendances.database', 'odoo');
        $username = (string) config('database.fdw.attendances.username', 'maya');
        $password = (string) config('database.fdw.attendances.password', 'secret');
        $schema = (string) config('database.fdw.attendances.schema', 'public');
        $source = (string) config('database.fdw.attendances.table', 'v_app_attendances');

        if (! PostgresFdwMigration::ensurePostgresFdwExtension('attendances catalog')) {
            return;
        }

        PostgresFdwMigration::createFdwServerWithUserMapping(
            self::FDW_SERVER,
            $host,
            $port,
            $database,
            $username,
            $password,
        );

        $foreignColumnsSql = 'id VARCHAR(64), user_id VARCHAR(255), '
            .'check_in TIMESTAMP, check_out TIMESTAMP, source VARCHAR(64)';

        $viewSelectSql = 'id, user_id, check_in, check_out, source';

        PostgresFdwMigration::createForeignTableWithPassThroughView(
            self::VIEW_NAME,
            $foreignColumnsSql,
            $viewSelectSql,
            self::FDW_SERVER,
            $schema,
            $source,
        );
    }
};
