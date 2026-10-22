<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Aplicaciones: FDW → maya_auth.applications (fuente de verdad del ecosistema).
 *
 * maya_auth_server y su user mapping se crean aquí con la conexión de
 * config('database.fdw.applications') (en producción, el rol lector maya_fdw_reader).
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
            // bigIncrements para que factories e inserts sin id funcionen en
            // tests; en producción la PK proviene del FDW maya_auth.applications
            // y NUNCA se inserta desde aquí.
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('slug', 100);
            $table->text('description')->nullable();
            $table->string('icon', 40)->nullable();
            $table->string('color', 7)->nullable();
            $table->string('traefik_url', 2048)->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('view_permission_slug', 150)->nullable();
            $table->timestamps();
        });
    }

    private function createFdwTable(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgres_fdw');

        // Conexión al maya_auth remoto desde config (FDW_APPLICATIONS_* / FDW_USER_PERMISSIONS_*).
        $host     = (string) config('database.fdw.applications.host', env('DB_HOST', 'maya_infra_postgres'));
        $port     = (string) config('database.fdw.applications.port', '5432');
        $database = (string) config('database.fdw.applications.database', 'maya_auth');
        $username = (string) config('database.fdw.applications.username', 'maya');
        $password = (string) config('database.fdw.applications.password', 'secret');
        $schema   = (string) config('database.fdw.applications.schema', 'public');
        $table    = (string) config('database.fdw.applications.table', 'applications');

        DB::statement(sprintf(
            "CREATE SERVER IF NOT EXISTS %s FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host %s, port %s, dbname %s)",
            self::SERVER,
            DB::getPdo()->quote($host),
            DB::getPdo()->quote($port),
            DB::getPdo()->quote($database),
        ));

        DB::statement(sprintf(
            "DO \$\$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_user_mappings
                    WHERE srvname = '%s' AND usename = CURRENT_USER
                ) THEN
                    CREATE USER MAPPING FOR CURRENT_USER SERVER %s OPTIONS (user %s, password %s);
                END IF;
            END \$\$",
            self::SERVER,
            self::SERVER,
            DB::getPdo()->quote($username),
            DB::getPdo()->quote($password),
        ));

        // Idempotente: drop primero para que migrate:fresh no falle
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');

        DB::statement("
            CREATE FOREIGN TABLE " . self::FDW_TBL . " (
                id                    bigint        NOT NULL,
                name                  varchar(255)  NOT NULL,
                slug                  varchar(100)  NOT NULL,
                description           text,
                icon                  varchar(40),
                color                 varchar(7),
                traefik_url           varchar(2048),
                is_active             boolean       NOT NULL DEFAULT true,
                view_permission_slug  varchar(150),
                created_at            timestamp,
                updated_at            timestamp
            )
            SERVER " . self::SERVER . "
            OPTIONS (schema_name " . DB::getPdo()->quote($schema) . ", table_name " . DB::getPdo()->quote($table) . ")
        ");
    }
};
