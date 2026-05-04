<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Aplicaciones: FDW → maya_auth.applications (fuente de verdad del ecosistema).
 *
 * maya_auth_server se crea aquí porque maya es superuser en maya_dashboard.
 * Columnas: id, name, slug, description, traefik_url, is_active, created_at, updated_at.
 */
return new class extends Migration
{
    private const SERVER  = 'maya_auth_server';
    private const FDW_TBL = 'applications';

    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgres_fdw');

        DB::statement("
            CREATE SERVER IF NOT EXISTS " . self::SERVER . "
            FOREIGN DATA WRAPPER postgres_fdw
            OPTIONS (host 'maya_infra_postgres', port '5432', dbname 'maya_auth')
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
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');

        DB::statement("
            CREATE FOREIGN TABLE " . self::FDW_TBL . " (
                id          bigint        NOT NULL,
                name        varchar(255)  NOT NULL,
                slug        varchar(100)  NOT NULL,
                description text,
                traefik_url varchar(2048),
                is_active   boolean       NOT NULL DEFAULT true,
                created_at  timestamp,
                updated_at  timestamp
            )
            SERVER " . self::SERVER . "
            OPTIONS (schema_name 'public', table_name 'applications')
        ");
    }

    public function down(): void
    {
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');
        DB::statement('DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER ' . self::SERVER);
        DB::statement('DROP SERVER IF EXISTS ' . self::SERVER . ' CASCADE');
    }
};
