<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $apps = [
            [
                'name'        => 'Maya Authorization',
                'slug'        => 'maya-authorization',
                'description' => 'Gestión de permisos y accesos del ecosistema Maya',
                'traefik_url' => 'http://maya_authorization.localhost',
                'is_active'   => true,
            ],
            [
                'name'        => 'Maya Dashboard',
                'slug'        => 'maya-dashboard',
                'description' => 'Panel principal del ecosistema Maya',
                'traefik_url' => 'http://maya_dashboard.localhost',
                'is_active'   => true,
            ],
            [
                'name'        => 'Maya DMS',
                'slug'        => 'maya-dms',
                'description' => 'Sistema de gestión documental',
                'traefik_url' => 'http://maya_dms.localhost',
                'is_active'   => true,
            ],
            [
                'name'        => 'Odoo',
                'slug'        => 'odoo',
                'description' => 'ERP corporativo',
                'traefik_url' => 'http://odoo.localhost',
                'is_active'   => true,
            ],
        ];

        foreach ($apps as $app) {
            Application::firstOrCreate(['slug' => $app['slug']], $app);
        }
    }
}
