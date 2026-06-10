# Snapshot de datos — maya_dashboard

Generado el 2026-06-10 17:47:56 con `php artisan db:generate-seeders`.
Un seeder por tabla con datos + `DatabaseSnapshotSeeder` que trunca,
siembra en orden FK y resetea secuencias. No editar a mano.

## Restaurar

```bash
php artisan db:seed --class="Database\Seeders\Snapshot\DatabaseSnapshotSeeder"
```

## Regenerar

```bash
php artisan db:generate-seeders
```