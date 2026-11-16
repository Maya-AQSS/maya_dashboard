<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NotificationRule;
use Illuminate\Database\Seeder;

/**
 * Default configurable instances for the scheduled notification definitions.
 * Admins can edit/add more from the dashboard; each owning service reads its
 * active rules via the v_notification_rules FDW view.
 */
class NotificationRuleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (self::defaults() as $rule) {
            NotificationRule::updateOrCreate(
                ['evaluator_key' => $rule['evaluator_key'], 'name' => $rule['name']],
                array_merge($rule, ['enabled' => true]),
            );
        }
    }

    /**
     * Default rule per scheduled evaluator (also used by ProductionSeeder).
     *
     * @return list<array{evaluator_key: string, source_app: string, name: string, params: array<string, int>, schedule_cron: string}>
     */
    public static function defaults(): array
    {
        return [
            [
                'evaluator_key' => 'dms.validation_deadline_approaching',
                'source_app' => 'maya-dms',
                'name' => 'Aviso de fecha límite de validación',
                'params' => ['days' => 7],
                'schedule_cron' => '0 7 * * *',
            ],
            [
                'evaluator_key' => 'dms.pending_validations_threshold',
                'source_app' => 'maya-dms',
                'name' => 'Aviso de documentos pendientes de validar',
                'params' => ['threshold' => 10],
                'schedule_cron' => '0 7 * * *',
            ],
            [
                'evaluator_key' => 'logs.error_spike',
                'source_app' => 'maya-logs',
                'name' => 'Aviso de pico de errores críticos',
                'params' => ['window_seconds' => 60, 'threshold' => 10],
                'schedule_cron' => '* * * * *',
            ],
        ];
    }
}
