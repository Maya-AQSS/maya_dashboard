<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;

// Migración 2026_10_15_000001 (D17, D21): las tablas foráneas del dashboard leen maya_apps y
// attendances_fdw queda de solo lectura. Sin PostgreSQL: se captura el SQL.

function readOdooViewsMigration(): object
{
    return require database_path('migrations/2026_10_15_000001_read_odoo_views_from_maya_apps.php');
}

/** @return list<string> */
function captureDashboardMigrationSql(callable $run, string $environment = 'production'): array
{
    $statements = [];
    DB::shouldReceive('statement')->andReturnUsing(function (string $sql) use (&$statements): bool {
        $statements[] = $sql;

        return true;
    });
    DB::shouldReceive('selectOne')->andReturn((object) ['present' => true]);

    app()->detectEnvironment(fn () => $environment);
    try {
        $run();
    } finally {
        app()->detectEnvironment(fn () => 'testing');
    }

    return $statements;
}

beforeEach(function (): void {
    config([
        'database.connections.pgsql.database' => 'maya_dashboard',
        'database.connections.pgsql.username' => 'dashboard_user',
    ]);
});

it('repoints the three Odoo foreign tables to maya_apps and revokes writes on attendances (D21)', function (): void {
    expect(captureDashboardMigrationSql(fn () => readOdooViewsMigration()->up()))->toBe([
        "ALTER FOREIGN TABLE IF EXISTS employee_profiles_fdw OPTIONS (SET schema_name 'maya_apps', SET table_name 'v_app_employee_profile')",
        "ALTER FOREIGN TABLE IF EXISTS attendances_fdw OPTIONS (SET schema_name 'maya_apps', SET table_name 'v_app_attendances')",
        "ALTER FOREIGN TABLE IF EXISTS bookings_fdw OPTIONS (SET schema_name 'maya_apps', SET table_name 'v_app_bookings')",
        'REVOKE INSERT, UPDATE, DELETE ON attendances_fdw FROM "dashboard_user"',
    ]);
});

it('goes back to public on down()', function (): void {
    expect(captureDashboardMigrationSql(fn () => readOdooViewsMigration()->down()))
        ->toContain("ALTER FOREIGN TABLE IF EXISTS attendances_fdw OPTIONS (SET schema_name 'public', SET table_name 'v_app_attendances')")
        ->toContain('GRANT INSERT, UPDATE ON attendances_fdw TO "dashboard_user"');
});

it('does nothing in testing (physical tables)', function (): void {
    expect(captureDashboardMigrationSql(fn () => readOdooViewsMigration()->up(), 'testing'))->toBe([]);
});

it('ships its own maya_apps views: employee profile and attendances, no bookings (D27)', function (): void {
    $views = array_map(fn (string $f) => basename($f, '.sql'), glob(database_path('views/*.sql')));
    sort($views);

    expect($views)->toBe(['v_app_attendances', 'v_app_employee_profile']);
});
