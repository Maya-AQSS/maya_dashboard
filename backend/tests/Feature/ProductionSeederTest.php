<?php

declare(strict_types=1);

use App\Models\NotificationDefinition;
use App\Models\NotificationRule;
use Database\Seeders\NotificationRuleSeeder;
use Database\Seeders\ProductionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/** @return array<string, mixed> */
function dashboardSeedSnapshot(): array
{
    return [
        'definitions' => NotificationDefinition::query()->orderBy('key')
            ->get(['key', 'enabled', 'default_severity', 'url_template', 'target_app', 'schedule_cron'])
            ->toArray(),
        'rules' => NotificationRule::query()->orderBy('evaluator_key')
            ->get(['evaluator_key', 'name', 'params', 'schedule_cron', 'enabled'])
            ->toArray(),
    ];
}

it('crea el catálogo de definiciones y una regla por evaluador', function () {
    $this->seed(ProductionSeeder::class);

    expect(NotificationDefinition::query()->count())->toBeGreaterThan(0)
        ->and(NotificationDefinition::query()->where('key', 'logs.error_spike')->exists())->toBeTrue();

    foreach (NotificationRuleSeeder::defaults() as $rule) {
        expect(NotificationRule::query()->where('evaluator_key', $rule['evaluator_key'])->count())->toBe(1);
    }
});

it('es idempotente: la segunda vez no duplica ni cambia nada', function () {
    $this->seed(ProductionSeeder::class);
    $first = dashboardSeedSnapshot();

    $this->seed(ProductionSeeder::class);

    expect(dashboardSeedSnapshot())->toBe($first);
});

it('conserva una definición desactivada desde el dashboard', function () {
    $this->seed(ProductionSeeder::class);
    NotificationDefinition::query()->where('key', 'document.published')->firstOrFail()
        ->update(['enabled' => false]);

    $this->seed(ProductionSeeder::class);

    expect(NotificationDefinition::query()->where('key', 'document.published')->value('enabled'))->toBeFalse();
});

it('no duplica una regla renombrada ni pisa sus parámetros', function () {
    $this->seed(ProductionSeeder::class);
    NotificationRule::query()->where('evaluator_key', 'logs.error_spike')->firstOrFail()
        ->update(['name' => 'Pico de errores (centro)', 'params' => ['window_seconds' => 300, 'threshold' => 50], 'enabled' => false]);

    $this->seed(ProductionSeeder::class);

    $rules = NotificationRule::query()->where('evaluator_key', 'logs.error_spike')->get();
    expect($rules)->toHaveCount(1)
        ->and($rules->first()->name)->toBe('Pico de errores (centro)')
        ->and($rules->first()->params)->toEqual(['window_seconds' => 300, 'threshold' => 50])
        ->and($rules->first()->enabled)->toBeFalse();
});
