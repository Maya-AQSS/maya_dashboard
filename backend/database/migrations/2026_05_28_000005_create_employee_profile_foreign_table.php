<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Maya\Platform\Database\PostgresFdwMigration;

/**
 * Vista local `employee_profiles` proyectada desde `odoo.public.v_app_employee_profile`
 * vía postgres_fdw.
 *
 * Fuente de verdad: Odoo (`maya_core_employee` + resolución de supervisor/mentor).
 * Read-only. La vista remota ya resuelve nombres de supervisor y mentor.
 *
 * Columnas expuestas:
 *   user_id                  — UUID Keycloak del empleado (clave de lookup)
 *   personal_email           — email personal (editable por el propio empleado)
 *   position_type            — tipo de plaza (AJC, PRM, ESPJ, …)
 *   supervisor_name          — nombre del responsable (nullable)
 *   mentor_name              — nombre del mentor (nullable)
 *   keys                     — estado de las llaves (HO, RT, PN)
 *   date_keys_handover       — fecha entrega de llaves (nullable)
 *   date_keys_return         — fecha devolución de llaves (nullable)
 *   iban                     — IBAN bancario (editable, nullable)
 *   id_card_rfid             — identificador RFID (nullable)
 *   car_registration_number_1/2/3 — matrículas (editables, nullable)
 */
return new class extends Migration
{
    private const VIEW_NAME  = 'employee_profiles';
    private const FDW_TABLE  = 'employee_profiles_fdw';
    private const FDW_SERVER = 'odoo_server';

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
        // No drop odoo_server: compartido con users / teams / team_members FDW.
    }

    private function createTestingTable(): void
    {
        DB::statement('
            CREATE TABLE IF NOT EXISTS employee_profiles (
                user_id                   VARCHAR(255) PRIMARY KEY,
                personal_email            VARCHAR(255) NULL,
                position_type             VARCHAR(16)  NULL,
                supervisor_name           VARCHAR(255) NULL,
                mentor_name               VARCHAR(255) NULL,
                keys                      VARCHAR(4)   NULL,
                date_keys_handover        DATE         NULL,
                date_keys_return          DATE         NULL,
                iban                      VARCHAR(34)  NULL,
                id_card_rfid              VARCHAR(64)  NULL,
                car_registration_number_1 VARCHAR(7)   NULL,
                car_registration_number_2 VARCHAR(7)   NULL,
                car_registration_number_3 VARCHAR(7)   NULL
            )
        ');
    }

    private function setupFdw(): void
    {
        $host     = (string) config('database.fdw.employee_profiles.host',     env('DB_HOST', 'maya_infra_postgres'));
        $port     = (string) config('database.fdw.employee_profiles.port',     '5432');
        $database = (string) config('database.fdw.employee_profiles.database', 'odoo');
        $username = (string) config('database.fdw.employee_profiles.username', 'maya');
        $password = (string) config('database.fdw.employee_profiles.password', 'secret');
        $schema   = (string) config('database.fdw.employee_profiles.schema',   'public');
        $source   = (string) config('database.fdw.employee_profiles.table',    'v_app_employee_profile');

        if (! PostgresFdwMigration::ensurePostgresFdwExtension('employee profiles')) {
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

        $foreignColumnsSql = 'user_id VARCHAR(255), personal_email VARCHAR(255), '
            .'position_type VARCHAR(16), supervisor_name VARCHAR(255), mentor_name VARCHAR(255), '
            .'keys VARCHAR(4), date_keys_handover DATE, date_keys_return DATE, '
            .'iban VARCHAR(34), id_card_rfid VARCHAR(64), '
            .'car_registration_number_1 VARCHAR(7), car_registration_number_2 VARCHAR(7), '
            .'car_registration_number_3 VARCHAR(7)';

        $viewSelectSql = 'user_id, personal_email, position_type, supervisor_name, mentor_name, '
            .'keys, date_keys_handover, date_keys_return, iban, id_card_rfid, '
            .'car_registration_number_1, car_registration_number_2, car_registration_number_3';

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
