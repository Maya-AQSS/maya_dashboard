<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Añade view_permission_slug al catálogo de aplicaciones (FDW → maya_auth).
 */
return new class extends Migration
{
    private const SERVER  = 'maya_auth_server';
    private const FDW_TBL = 'applications';

    public function up(): void
    {
        if ($this->isTestEnv()) {
            Schema::table(self::FDW_TBL, function (Blueprint $table) {
                $table->string('view_permission_slug', 150)->nullable()->after('is_active');
            });

            return;
        }

        $this->recreateFdwTable();
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            Schema::table(self::FDW_TBL, function (Blueprint $table) {
                $table->dropColumn('view_permission_slug');
            });

            return;
        }

        $this->recreateFdwTableWithoutSlug();
    }

    private function isTestEnv(): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        $db = config('database.connections.pgsql.database');

        return is_string($db) && str_ends_with($db, '_test');
    }

    private function recreateFdwTable(): void
    {
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');

        DB::statement('
            CREATE FOREIGN TABLE ' . self::FDW_TBL . ' (
                id                    bigint        NOT NULL,
                name                  varchar(255)  NOT NULL,
                slug                  varchar(100)  NOT NULL,
                description           text,
                traefik_url           varchar(2048),
                is_active             boolean       NOT NULL DEFAULT true,
                view_permission_slug  varchar(150),
                created_at            timestamp,
                updated_at            timestamp
            )
            SERVER ' . self::SERVER . '
            OPTIONS (schema_name \'public\', table_name \'applications\')
        ');
    }

    private function recreateFdwTableWithoutSlug(): void
    {
        DB::statement('DROP FOREIGN TABLE IF EXISTS ' . self::FDW_TBL . ' CASCADE');

        DB::statement('
            CREATE FOREIGN TABLE ' . self::FDW_TBL . ' (
                id          bigint        NOT NULL,
                name        varchar(255)  NOT NULL,
                slug        varchar(100)  NOT NULL,
                description text,
                traefik_url varchar(2048),
                is_active   boolean       NOT NULL DEFAULT true,
                created_at  timestamp,
                updated_at  timestamp
            )
            SERVER ' . self::SERVER . '
            OPTIONS (schema_name \'public\', table_name \'applications\')
        ');
    }
};
