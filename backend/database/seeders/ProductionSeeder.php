<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NotificationDefinition;
use App\Models\NotificationRule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Datos de referencia de producción (plan de las apps, § 4.5).
 *
 * Se lanza a mano y una vez, tras el primer despliegue, con el Job de
 * deploy/jobs/artisan-job.yaml (nunca en el hook de migración):
 *
 *   php artisan db:seed --class=ProductionSeeder --force
 *
 * Idempotente, y sin pisar lo que se cambie desde el dashboard:
 * - Definiciones de notificación: NotificationDefinitionSeeder (por `key`, no duplica). El
 *   interruptor `enabled`, lo único que un administrador cambia, se conserva en las que ya
 *   existían; las nuevas llegan con el valor del catálogo.
 * - Reglas: la regla por defecto de NotificationRuleSeeder::defaults() solo para los
 *   evaluadores que no tengan ninguna (aunque se haya renombrado o desactivado la suya).
 */
final class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedDefinitions();
            $this->seedDefaultRules();
        });
    }

    private function seedDefinitions(): void
    {
        /** @var array<string, bool> $enabled */
        $enabled = NotificationDefinition::query()->pluck('enabled', 'key')->all();

        $this->call(NotificationDefinitionSeeder::class);

        $restored = 0;
        foreach (NotificationDefinition::query()->whereIn('key', array_keys($enabled))->get() as $definition) {
            $definition->enabled = (bool) $enabled[$definition->key];
            if ($definition->isDirty('enabled')) {
                $definition->save();
                $restored++;
            }
        }

        $total = NotificationDefinition::query()->count();
        $this->command?->info("  Definiciones: {$total} (".($total - count($enabled))." nuevas; {$restored} interruptores conservados)");
    }

    private function seedDefaultRules(): void
    {
        $withRules = NotificationRule::query()->distinct()->pluck('evaluator_key')->all();

        foreach (NotificationRuleSeeder::defaults() as $rule) {
            if (in_array($rule['evaluator_key'], $withRules, true)) {
                $this->command?->info("  = {$rule['evaluator_key']}: ya tiene regla");

                continue;
            }

            NotificationRule::query()->create([...$rule, 'enabled' => true]);
            $this->command?->info("  + {$rule['evaluator_key']}: {$rule['name']}");
        }
    }
}
