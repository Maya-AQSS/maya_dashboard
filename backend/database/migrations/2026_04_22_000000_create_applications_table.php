<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Aplicaciones: FDW → maya_auth.applications (fuente de verdad del ecosistema).
 *
 * maya_auth_server se crea aquí porque maya es superuser en maya_dashboard.
 * Columnas: id, name, slug, description, traefik_url, is_active, created_at, updated_at.
 *
 * Producción/staging: FOREIGN TABLE → maya_auth.applications.
 * Local/testing:      tabla stub con la misma estructura para las factories.
 */
return new class extends Migration
{
    private const SERVER  = 'maya_auth_server';
    private const FDW_TBL = 'applications';

    public function up(): void
    {
        if ($this->isTestEnv()) {
            $this->createStubTable();
        } else {
            $this->createFdwTable();
        }
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            Schema::dropIfExists(self::FDW_TBL);
        } else {
            DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');
            DB::statement('DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER ' . self::SERVER);
            DB::statement('DROP SERVER IF EXISTS ' . self::SERVER . ' CASCADE');
        }
    }

    private function isTestEnv(): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        $db = config('database.connections.pgsql.database');
        return is_string($db) && str_ends_with($db, '_test');
    }

    private function createStubTable(): void
    {
        Schema::create(self::FDW_TBL, function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->string('name');
            $table->string('slug', 100);
            $table->text('description')->nullable();
            $table->string('traefik_url', 2048)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createFdwTable(): void
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
};
