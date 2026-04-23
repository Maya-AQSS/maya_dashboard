<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FK and local table
        DB::statement('ALTER TABLE user_favorite_applications DROP CONSTRAINT IF EXISTS user_favorite_applications_application_id_foreign');
        DB::statement('DROP TABLE IF EXISTS applications CASCADE');

        // FDW setup
        DB::statement("CREATE EXTENSION IF NOT EXISTS postgres_fdw");

        DB::statement("
            CREATE SERVER IF NOT EXISTS maya_auth_server
            FOREIGN DATA WRAPPER postgres_fdw
            OPTIONS (host 'maya_infra_postgres', port '5432', dbname 'maya_auth')
        ");

        DB::statement("
            CREATE USER MAPPING IF NOT EXISTS FOR maya
            SERVER maya_auth_server
            OPTIONS (user 'maya', password 'secret')
        ");

        // Foreign table — only columns dashboard needs
        DB::statement("
            CREATE FOREIGN TABLE applications (
                id          bigint       NOT NULL,
                name        varchar(255) NOT NULL,
                slug        varchar(100) NOT NULL,
                description text,
                traefik_url varchar(2048),
                is_active   boolean      NOT NULL DEFAULT true,
                created_at  timestamp,
                updated_at  timestamp
            )
            SERVER maya_auth_server
            OPTIONS (schema_name 'public', table_name 'applications')
        ");
    }

    public function down(): void
    {
        DB::statement('DROP FOREIGN TABLE IF EXISTS applications');
        DB::statement('DROP USER MAPPING IF EXISTS FOR maya SERVER maya_auth_server');
        DB::statement('DROP SERVER IF EXISTS maya_auth_server CASCADE');
    }
};
