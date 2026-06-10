<?php

declare(strict_types=1);

namespace Database\Seeders\Snapshot;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Restaura el snapshot completo: trunca las tablas, siembra en orden de
 * dependencias FK y resetea las secuencias. Las tablas del snapshot que no
 * existan en la BD destino (p. ej. tablas creadas fuera de migraciones) se
 * omiten con aviso. Generado por db:generate-seeders.
 */
class DatabaseSnapshotSeeder extends Seeder
{
    /** Todas las tablas del snapshot, en orden de dependencias FK. */
    private const TABLES = [
        'notification_definitions',
        'notification_rules',
        'notifications',
        'panel_alerts',
        'translations',
        'user_dashboard_layouts',
        'user_favorite_applications',
    ];

    /** Solo las tablas con filas, en el mismo orden. */
    private const SEEDERS = [
        'notification_definitions' => NotificationDefinitionsTableSeeder::class,
        'notification_rules' => NotificationRulesTableSeeder::class,
        'notifications' => NotificationsTableSeeder::class,
    ];

    public function run(): void
    {
        if (app()->isProduction()) {
            throw new \RuntimeException('Snapshot seeder deshabilitado en producción.');
        }

        $existing = $this->existingTables();
        foreach (array_diff(self::TABLES, $existing) as $missing) {
            $this->command?->warn("Tabla '{$missing}' no existe en la BD destino; se omite.");
        }

        DB::transaction(function () use ($existing): void {
            $this->truncateAll($existing);
            $this->call(array_values(array_intersect_key(
                self::SEEDERS,
                array_flip($existing),
            )));
            $this->resetSequences();
        });
    }

    /** @return list<string> */
    private function existingTables(): array
    {
        $names = array_column(DB::select(
            'SELECT tablename FROM pg_tables WHERE schemaname = current_schema()',
        ), 'tablename');

        return array_values(array_intersect(self::TABLES, $names));
    }

    /** @param list<string> $tables */
    private function truncateAll(array $tables): void
    {
        $quoted = implode(', ', array_map(
            static fn (string $table): string => '"'.$table.'"',
            $tables,
        ));

        DB::statement('TRUNCATE TABLE '.$quoted.' RESTART IDENTITY CASCADE');
    }

    /** Deja cada secuencia serial/identity apuntando a MAX(col)+1. */
    private function resetSequences(): void
    {
        $columns = DB::select(<<<'SQL'
            SELECT table_name, column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND (column_default LIKE 'nextval(%' OR is_identity = 'YES')
            SQL);

        foreach ($columns as $column) {
            if (! in_array($column->table_name, self::TABLES, true)) {
                continue;
            }

            DB::statement(sprintf(
                'SELECT setval(pg_get_serial_sequence(\'%1$s\', \'%2$s\'), (SELECT COALESCE(MAX("%2$s"), 0) FROM "%1$s") + 1, false)',
                $column->table_name,
                $column->column_name,
            ));
        }
    }
}
