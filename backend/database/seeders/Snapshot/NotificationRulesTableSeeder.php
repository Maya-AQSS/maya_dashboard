<?php

declare(strict_types=1);

namespace Database\Seeders\Snapshot;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Generado por db:generate-seeders — no editar a mano. */
class NotificationRulesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('notification_rules')->insert(
        array (
          0 => 
          array (
            'id' => 1,
            'evaluator_key' => 'dms.validation_deadline_approaching',
            'source_app' => 'maya-dms',
            'name' => 'Aviso de fecha límite de validación',
            'description' => NULL,
            'params' => '{"days": 7}',
            'schedule_cron' => '0 7 * * *',
            'audience' => NULL,
            'severity' => NULL,
            'enabled' => true,
            'created_by' => NULL,
            'created_at' => '2026-06-10 16:40:59+00',
            'updated_at' => '2026-06-10 16:40:59+00',
          ),
          1 => 
          array (
            'id' => 2,
            'evaluator_key' => 'dms.pending_validations_threshold',
            'source_app' => 'maya-dms',
            'name' => 'Aviso de documentos pendientes de validar',
            'description' => NULL,
            'params' => '{"threshold": 10}',
            'schedule_cron' => '0 7 * * *',
            'audience' => NULL,
            'severity' => NULL,
            'enabled' => true,
            'created_by' => NULL,
            'created_at' => '2026-06-10 16:40:59+00',
            'updated_at' => '2026-06-10 16:40:59+00',
          ),
          2 => 
          array (
            'id' => 3,
            'evaluator_key' => 'logs.error_spike',
            'source_app' => 'maya-logs',
            'name' => 'Aviso de pico de errores críticos',
            'description' => NULL,
            'params' => '{"threshold": 10, "window_seconds": 60}',
            'schedule_cron' => '* * * * *',
            'audience' => NULL,
            'severity' => NULL,
            'enabled' => true,
            'created_by' => NULL,
            'created_at' => '2026-06-10 16:40:59+00',
            'updated_at' => '2026-06-10 16:40:59+00',
          ),
        )
        );
    }
}
