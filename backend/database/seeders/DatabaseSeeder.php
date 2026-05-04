<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuarios provienen de Odoo vía FDW (read-only) — no se crean aquí.
        $this->call([
            AlertRuleSeeder::class,
        ]);
    }
}
