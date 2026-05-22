<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Añade `icon` y `color` al catálogo de aplicaciones (FDW → maya_auth).
 *
 * En producción/staging: recrea la FOREIGN TABLE con las nuevas columnas.
 * En testing: ALTER del stub table.
 *
 * La fuente de verdad es `maya_authorization.applications` — la migración
 * paralela en ese servicio (`2026_05_22_130000_add_icon_and_color_to_applications_table`)
 * añade las columnas físicas. Esta migración solo refleja el cambio en el
 * mirror del dashboard.
 */
return new class extends Migration
{
    private const SERVER  = 'maya_auth_server';
    private const FDW_TBL = 'applications';

    public function up(): void
    {
        if ($this->isTestEnv()) {
            Schema::table(self::FDW_TBL, function (Blueprint $table) {
                $table->string('icon', 40)->nullable()->after('description');
                $table->string('color', 7)->nullable()->after('icon');
            });

            return;
        }

        $this->recreateFdwTable();
    }

    public function down(): void
    {
        if ($this->isTestEnv()) {
            Schema::table(self::FDW_TBL, function (Blueprint $table) {
                $table->dropColumn(['icon', 'color']);
            });

            return;
        }

        $this->recreateFdwTableWithoutIconColor();
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
                icon                  varchar(40),
                color                 varchar(7),
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

    private function recreateFdwTableWithoutIconColor(): void
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
};
