<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Maya\Platform\Database\PostgresFdwMigration;

/**
 * Vista local `bookings` proyectada desde `odoo.public.v_app_bookings`
 * vía postgres_fdw.
 *
 * Fuente de verdad: módulo Odoo de reservas (read-only). El dashboard solo lee
 * el listado de reservas activas del usuario; nunca escribe.
 *
 * Rutas:
 * - `testing`:                  tabla física `bookings`.
 * - `local|staging|production`: FDW + vista pass-through hacia `odoo.public.v_app_bookings`.
 *
 * Columnas expuestas en la vista local `bookings`:
 *   id            — PK de la reserva (varchar)
 *   user_id       — UUID Keycloak del usuario
 *   title         — descripción visible
 *   resource_id   — id del recurso reservado (nullable)
 *   resource_name — nombre del recurso (aula, equipo, …)
 *   start_at      — inicio
 *   end_at        — fin
 *   all_day       — true si la reserva ocupa el día completo
 *   status        — 'confirmed', 'pending', 'cancelled'
 */
return new class extends Migration
{
    private const VIEW_NAME = 'bookings';

    private const FDW_TABLE = 'bookings_fdw';

    private const FDW_SERVER = 'odoo_bookings_server';

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
            CREATE TABLE IF NOT EXISTS bookings (
                id            VARCHAR(64) PRIMARY KEY,
                user_id       VARCHAR(255) NOT NULL,
                title         VARCHAR(255) NOT NULL,
                resource_id   VARCHAR(64) NULL,
                resource_name VARCHAR(255) NULL,
                start_at      TIMESTAMP NOT NULL,
                end_at        TIMESTAMP NOT NULL,
                all_day       BOOLEAN NOT NULL DEFAULT FALSE,
                status        VARCHAR(32) NOT NULL DEFAULT \'confirmed\'
            )
        ');
        DB::statement('CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS bookings_start_at_idx ON bookings (start_at)');
    }

    private function setupFdw(): void
    {
        $host = (string) config('database.fdw.bookings.host', env('DB_HOST', 'maya_infra_postgres'));
        $port = (string) config('database.fdw.bookings.port', '5432');
        $database = (string) config('database.fdw.bookings.database', 'odoo');
        $username = (string) config('database.fdw.bookings.username', 'maya');
        $password = (string) config('database.fdw.bookings.password', 'secret');
        $schema = (string) config('database.fdw.bookings.schema', 'public');
        $source = (string) config('database.fdw.bookings.table', 'v_app_bookings');

        if (! PostgresFdwMigration::ensurePostgresFdwExtension('bookings catalog')) {
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

        $foreignColumnsSql = 'id VARCHAR(64), user_id VARCHAR(255), title VARCHAR(255), '
            .'resource_id VARCHAR(64), resource_name VARCHAR(255), '
            .'start_at TIMESTAMP, end_at TIMESTAMP, all_day BOOLEAN, status VARCHAR(32)';

        $viewSelectSql = 'id, user_id, title, resource_id, resource_name, '
            .'start_at, end_at, all_day, status';

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
