<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Usuarios: FDW → Odoo.v_app_users.
 *
 * id = KC UUID (varchar 255) — NO bigint autoincrement.
 * Auth gestionada por Keycloak; no se almacena password local.
 *
 * Producción/staging: FDW → odoo.v_app_users.
 * Local/testing:      tabla stub con la misma estructura para que las
 *                     factories puedan insertar sin FDW.
 */
return new class extends Migration
{
    private const SERVER  = 'odoo_server';
    private const FDW_TBL = 'users_fdw';
    private const VIEW    = 'users';

    public function up(): void
    {
        if ($this->isTestEnv()) {
            $this->createStubTable();
        } else {
            $this->createFdwView();
        }
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            Schema::dropIfExists(self::VIEW);
        } else {
            DB::statement('DROP VIEW IF EXISTS ' . self::VIEW);
            DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL);
            DB::statement('DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER ' . self::SERVER);
            DB::statement('DROP SERVER IF EXISTS ' . self::SERVER . ' CASCADE');
        }
    }

    private function isTestEnv(): bool
    {
        // Detect testing via DB name as fallback: APP_ENV may be 'local' inside
        // the container while phpunit overrides DB_DATABASE → maya_*_test.
        if (app()->environment('testing')) {
            return true;
        }

        $db = config('database.connections.pgsql.database');
        return is_string($db) && str_ends_with($db, '_test');
    }

    private function createStubTable(): void
    {
        Schema::create(self::VIEW, function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->string('first_name', 150)->nullable();
            $table->string('last_name', 150)->nullable();
            $table->string('username', 150)->nullable();
            $table->string('employee_id', 64)->nullable();
            $table->string('dni', 32)->nullable();
            $table->string('employee_type', 64)->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    private function createFdwView(): void
    {
        // FDW → Odoo (maya es superuser en maya_dashboard)
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgres_fdw');

        DB::statement("
            CREATE SERVER IF NOT EXISTS " . self::SERVER . "
            FOREIGN DATA WRAPPER postgres_fdw
            OPTIONS (host 'maya_infra_postgres', port '5432', dbname 'odoo')
        ");

        DB::statement("
            DO \$\$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_user_mappings
                    WHERE srvname = '" . self::SERVER . "' AND usename = CURRENT_USER
                ) THEN
                    CREATE USER MAPPING FOR CURRENT_USER
                    SERVER " . self::SERVER . "
                    OPTIONS (user 'maya', password 'secret');
                END IF;
            END \$\$
        ");

        // Idempotente: drop primero para que migrate:fresh no falle
        DB::statement('DROP VIEW IF EXISTS ' . self::VIEW . ' CASCADE');
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');

        DB::statement("
            CREATE FOREIGN TABLE " . self::FDW_TBL . " (
                id            varchar(255) NOT NULL,
                email         varchar(255) NOT NULL,
                display_name  varchar(255),
                first_name    varchar(150),
                last_name     varchar(150),
                username      varchar(150),
                employee_id   varchar(64),
                dni           varchar(32),
                employee_type varchar(64),
                is_active     boolean NOT NULL DEFAULT true
            )
            SERVER " . self::SERVER . "
            OPTIONS (schema_name 'public', table_name 'v_app_users')
        ");

        DB::statement("
            CREATE VIEW " . self::VIEW . " AS
            SELECT id,
                   display_name AS name,
                   email,
                   first_name,
                   last_name,
                   username,
                   employee_id,
                   dni,
                   employee_type,
                   is_active
            FROM " . self::FDW_TBL . "
        ");
    }
};
