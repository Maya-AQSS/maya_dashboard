<?php

namespace Database\Seeders;

use App\Models\AlertRule;
use Illuminate\Database\Seeder;

class AlertRuleSeeder extends Seeder
{
    public function run(): void
    {
        AlertRule::updateOrCreate(
            ['slug' => 'error-spike-global'],
            [
                'name'          => 'Pico global de errores críticos',
                'description'   => 'Alerta si hay >10 logs críticos en 1 minuto sumando todas las apps.',
                'query_sql'     => "SELECT application_id, COUNT(*) AS cnt
                                      FROM logs
                                     WHERE severity = 'critical'
                                       AND created_at > NOW() - INTERVAL '1 minute'
                                  GROUP BY application_id
                                    HAVING COUNT(*) > 10",
                'severity'      => 'critical',
                'schedule_cron' => '* * * * *',
                'enabled'       => true,
            ],
        );

        AlertRule::updateOrCreate(
            ['slug' => 'high-errors-sustained'],
            [
                'name'          => 'Errores HIGH sostenidos (15 min)',
                'description'   => 'Alerta si >50 logs high en 15 minutos (cualquier app).',
                'query_sql'     => "SELECT COUNT(*) AS cnt
                                      FROM logs
                                     WHERE severity IN ('high','critical')
                                       AND created_at > NOW() - INTERVAL '15 minutes'
                                    HAVING COUNT(*) > 50",
                'severity'      => 'high',
                'schedule_cron' => '*/5 * * * *',
                'enabled'       => true,
            ],
        );
    }
}
