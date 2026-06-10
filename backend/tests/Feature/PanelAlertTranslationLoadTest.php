<?php

declare(strict_types=1);

use App\Models\PanelAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Maya\Messaging\Publishers\AuditPublisher;

uses(RefreshDatabase::class);

/**
 * Regresión: cargar traducciones polimórficas de un modelo con clave entera
 * (PanelAlert.id = bigint) contra una columna `translations.translatable_id`
 * VARCHAR rompía en Postgres con "operator does not exist: character varying =
 * integer" — Laravel usaba `whereIntegerInRaw`/binding entero. Tras el fix la FK
 * polimórfica se compara como string en eager, lazy y `updateOrCreate`.
 */
beforeEach(function () {
    config(['broadcasting.default' => 'null']);
    // Silenciar side effects del PanelAlertObserver.
    $this->app->instance(AuditPublisher::class, Mockery::mock(AuditPublisher::class)->shouldIgnoreMissing());
});

function translatableAlert(): PanelAlert
{
    return PanelAlert::forceCreate([
        'text' => 'Texto por defecto',
        'default_locale' => 'es',
        'severity' => 'high',
        'visible_from' => now()->subHour(),
        'source' => 'manual',
        'created_by' => (string) Str::uuid(),
    ]);
}

it('sincroniza y carga traducciones sin error de tipo en Postgres', function () {
    $alert = translatableAlert();

    // updateOrCreate path (consulta la relación con la PK entera del padre).
    $alert->syncTranslations('text', ['es' => 'Hola', 'va' => 'Hola (va)']);

    // Eager loading: fresh(['translations']) — whereIn sobre translatable_id.
    $fresh = $alert->fresh(['translations']);
    expect($fresh->translations)->toHaveCount(2);

    // Lazy loading + fallback.
    expect($alert->fresh()->translate('text', 'va', 'es'))->toBe('Hola (va)');
    expect($alert->fresh()->translate('text', 'en', 'es'))->toBe('Hola');

    // Segunda pasada de sync (updateOrCreate sobre filas existentes + borrado).
    $alert->syncTranslations('text', ['es' => 'Hola v2']);
    expect($alert->fresh(['translations'])->translations)->toHaveCount(1);
    expect($alert->fresh()->translate('text', 'es', 'es'))->toBe('Hola v2');
});
