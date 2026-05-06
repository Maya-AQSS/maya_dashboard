<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Usuarios: FDW → Odoo.v_app_users.
 *
 * id = KC UUID (varchar 255) — NO bigint autoincrement.
 * Auth gestionada por Keycloak; no se almacena password local.
 */
return new class extends Migration
{
    private const SERVER  = 'odoo_server';
    private const FDW_TBL = 'users_fdw';
    private const VIEW    = 'users';

    public function up(): void
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

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS ' . self::VIEW);
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL);
        DB::statement('DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER ' . self::SERVER);
        DB::statement('DROP SERVER IF EXISTS ' . self::SERVER . ' CASCADE');
    }
};
