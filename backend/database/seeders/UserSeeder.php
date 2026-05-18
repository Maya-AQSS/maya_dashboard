<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Pobla la tabla local `users` (stub FDW en testing/local) con identidad
     * mínima: email + name + first_name + last_name + username.
     *
     * Si Keycloak User Federation con Odoo no está totalmente sincronizado al
     * primer login, el JWT puede llegar sin estos atributos y el SPA pediría
     * datos al usuario. Poblando aquí los registros conocidos garantizamos
     * que `/me` y la auditoría tienen siempre nombre + apellido.
     *
     * En entornos donde `users` es una vista FDW (read-only) este seeder es
     * un no-op (la inserción fallaría); la sincronización viene de Odoo via
     * Keycloak User Federation.
     */
    public function run(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        // Detectar si users es una tabla local stub (testing) o una vista FDW
        // (producción/local con FDW). Una vista FDW no acepta inserciones.
        $isStubTable = Schema::hasColumn('users', 'id') &&
            in_array(DB::connection()->getDriverName(), ['pgsql', 'sqlite'], true);

        if (! $isStubTable) {
            return;
        }

        $users = [
            [
                'id' => '00000000-0000-0000-0000-000000000001',
                'email' => 'admin@maya.local',
                'name' => 'System Administrator',
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'username' => 'admin',
                'is_active' => true,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000002',
                'email' => 'dashboard.user@maya.local',
                'name' => 'Dashboard User',
                'first_name' => 'Dashboard',
                'last_name' => 'User',
                'username' => 'dashboard-user',
                'is_active' => true,
            ],
        ];

        try {
            DB::table('users')->upsert(
                $users,
                ['id'],
                ['email', 'name', 'first_name', 'last_name', 'username', 'is_active'],
            );
        } catch (\Throwable) {
            // No-op: la tabla puede ser una vista FDW de solo lectura.
            // En ese caso la sincronización vive en Odoo/Keycloak.
        }
    }
}
