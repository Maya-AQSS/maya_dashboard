<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $fdw = config('database.fdw.odoo', []);
        $enabled = (bool) ($fdw['enabled'] ?? false);

        if (! $enabled) {
            return;
        }

        $server = (string) ($fdw['server'] ?? 'odoo_server');
        $host = (string) ($fdw['host'] ?? '');
        $port = (string) ($fdw['port'] ?? '5432');
        $database = (string) ($fdw['database'] ?? '');
        $username = (string) ($fdw['username'] ?? '');
        $password = (string) ($fdw['password'] ?? '');
        $schema = (string) ($fdw['schema'] ?? 'public');
        $localUser = (string) config('database.connections.pgsql.username', 'maya');

        if ($host === '' || $database === '' || $username === '' || $password === '') {
            return;
        }

        DB::statement('CREATE EXTENSION IF NOT EXISTS postgres_fdw');

        DB::statement(sprintf(
            "CREATE SERVER IF NOT EXISTS %s FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host %s, port %s, dbname %s)",
            $this->quoteIdentifier($server),
            $this->quoteLiteral($host),
            $this->quoteLiteral($port),
            $this->quoteLiteral($database),
        ));

        DB::statement(sprintf(
            "GRANT USAGE ON FOREIGN SERVER %s TO %s",
            $this->quoteIdentifier($server),
            $this->quoteIdentifier($localUser),
        ));

        DB::statement(sprintf(
            "CREATE USER MAPPING IF NOT EXISTS FOR %s SERVER %s OPTIONS (user %s, password %s)",
            $this->quoteIdentifier($localUser),
            $this->quoteIdentifier($server),
            $this->quoteLiteral($username),
            $this->quoteLiteral($password),
        ));

        $this->createForeignTable(
            name: 'odoo_res_users_fdw',
            columnsSql: 'id BIGINT, login VARCHAR(255), active BOOLEAN, maya_employee_id BIGINT',
            server: $server,
            schema: $schema,
            sourceTable: 'res_users',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_employee_fdw',
            columnsSql: 'id BIGINT, user_id BIGINT, dni VARCHAR(9), name VARCHAR(255), surname VARCHAR(255), employee_type VARCHAR(255), position_type VARCHAR(255)',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_employee',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_team_fdw',
            columnsSql: 'id BIGINT, abbr VARCHAR(5), name JSONB, is_departament BOOLEAN',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_team',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_employee_team_rel_fdw',
            columnsSql: 'maya_core_employee_id BIGINT, maya_core_team_id BIGINT',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_employee_maya_core_team_rel',
        );

        $this->createForeignTable(
            name: 'odoo_res_company_fdw',
            columnsSql: 'id BIGINT, name VARCHAR(255), active BOOLEAN',
            server: $server,
            schema: $schema,
            sourceTable: 'res_company',
        );

        $this->createForeignTable(
            name: 'odoo_res_company_users_rel_fdw',
            columnsSql: 'cid BIGINT, user_id BIGINT',
            server: $server,
            schema: $schema,
            sourceTable: 'res_company_users_rel',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_study_fdw',
            columnsSql: 'id BIGINT, company_id BIGINT, code VARCHAR(7), family VARCHAR(255), law VARCHAR(255), name JSONB, active BOOLEAN',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_study',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_subject_fdw',
            columnsSql: 'id BIGINT, code VARCHAR(11), year VARCHAR(255), name JSONB, optional BOOLEAN',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_subject',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_study_subject_rel_fdw',
            columnsSql: 'maya_core_study_id BIGINT, maya_core_subject_id BIGINT',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_study_maya_core_subject_rel',
        );

        $this->createForeignTable(
            name: 'odoo_maya_core_subject_employee_rel_fdw',
            columnsSql: 'subject_id BIGINT, employee_id BIGINT, study_id BIGINT',
            server: $server,
            schema: $schema,
            sourceTable: 'maya_core_subject_employee_rel',
        );

        DB::statement('DROP VIEW IF EXISTS odoo_user_profiles');
        DB::statement(<<<'SQL'
            CREATE VIEW odoo_user_profiles AS
            SELECT
                u.id AS odoo_user_id,
                u.login AS email,
                u.active,
                e.id AS employee_id,
                e.dni,
                e.name,
                e.surname,
                CONCAT_WS(' ', e.name, e.surname) AS full_name,
                e.employee_type,
                e.position_type
            FROM odoo_res_users_fdw u
            LEFT JOIN odoo_maya_core_employee_fdw e ON e.user_id = u.id
        SQL);

        DB::statement('DROP VIEW IF EXISTS odoo_user_teams');
        DB::statement(<<<'SQL'
            CREATE VIEW odoo_user_teams AS
            SELECT
                e.user_id AS odoo_user_id,
                t.id AS team_id,
                t.abbr AS team_code,
                t.name AS team_name,
                t.is_departament
            FROM odoo_maya_core_employee_fdw e
            JOIN odoo_maya_core_employee_team_rel_fdw rel
              ON rel.maya_core_employee_id = e.id
            JOIN odoo_maya_core_team_fdw t
              ON t.id = rel.maya_core_team_id
        SQL);

        DB::statement('DROP VIEW IF EXISTS odoo_user_study_types');
        DB::statement(<<<'SQL'
            CREATE VIEW odoo_user_study_types AS
            SELECT DISTINCT
                rel.user_id AS odoo_user_id,
                c.id AS study_type_id,
                c.name AS study_type_name
            FROM odoo_res_company_users_rel_fdw rel
            JOIN odoo_res_company_fdw c
              ON c.id = rel.cid
        SQL);

        DB::statement('DROP VIEW IF EXISTS odoo_user_studies');
        DB::statement(<<<'SQL'
            CREATE VIEW odoo_user_studies AS
            SELECT DISTINCT
                rel.user_id AS odoo_user_id,
                s.id AS study_id,
                s.company_id AS study_type_id,
                s.code AS study_code,
                s.name AS study_name
            FROM odoo_res_company_users_rel_fdw rel
            JOIN odoo_maya_core_study_fdw s
              ON s.company_id = rel.cid
        SQL);

        DB::statement('DROP VIEW IF EXISTS odoo_user_modules');
        DB::statement(<<<'SQL'
            CREATE VIEW odoo_user_modules AS
            SELECT DISTINCT
                e.user_id AS odoo_user_id,
                se.study_id,
                sub.id AS module_id,
                sub.code AS module_code,
                sub.name AS module_name
            FROM odoo_maya_core_employee_fdw e
            JOIN odoo_maya_core_subject_employee_rel_fdw se
              ON se.employee_id = e.id
            JOIN odoo_maya_core_subject_fdw sub
              ON sub.id = se.subject_id
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS odoo_user_modules');
        DB::statement('DROP VIEW IF EXISTS odoo_user_studies');
        DB::statement('DROP VIEW IF EXISTS odoo_user_study_types');
        DB::statement('DROP VIEW IF EXISTS odoo_user_teams');
        DB::statement('DROP VIEW IF EXISTS odoo_user_profiles');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_subject_employee_rel_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_study_subject_rel_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_subject_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_study_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_res_company_users_rel_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_res_company_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_employee_team_rel_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_team_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_maya_core_employee_fdw');
        DB::statement('DROP FOREIGN TABLE IF EXISTS odoo_res_users_fdw');
    }

    private function createForeignTable(
        string $name,
        string $columnsSql,
        string $server,
        string $schema,
        string $sourceTable,
    ): void {
        DB::statement(sprintf('DROP FOREIGN TABLE IF EXISTS %s', $this->quoteIdentifier($name)));

        DB::statement(sprintf(
            'CREATE FOREIGN TABLE %s (%s) SERVER %s OPTIONS (schema_name %s, table_name %s)',
            $this->quoteIdentifier($name),
            $columnsSql,
            $this->quoteIdentifier($server),
            $this->quoteLiteral($schema),
            $this->quoteLiteral($sourceTable),
        ));
    }

    private function quoteIdentifier(string $identifier): string
    {
        return '"'.str_replace('"', '""', $identifier).'"';
    }

    private function quoteLiteral(string $value): string
    {
        return "'".str_replace("'", "''", $value)."'";
    }
};
