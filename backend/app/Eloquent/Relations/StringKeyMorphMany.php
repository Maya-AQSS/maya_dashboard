<?php

declare(strict_types=1);

namespace App\Eloquent\Relations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * MorphMany que compara la FK polimórfica como string.
 *
 * La tabla `translations.translatable_id` es VARCHAR (soporta bigint y UUID bajo
 * el mismo esquema), pero el modelo padre (p.ej. PanelAlert) tiene clave entera.
 * Eloquent, al ver `keyType = int`, usa `whereIntegerInRaw` (eager) e incrusta la
 * clave como entero crudo, y bindea la PK como `PDO::PARAM_INT` (lazy). En Postgres
 * `varchar = integer` no tiene operador → "operator does not exist: character
 * varying = integer". Forzamos comparación bound como string en ambos caminos para
 * que Postgres compare `varchar = varchar`. (Portar aguas arriba a
 * shared-translations-laravel::HasTranslations.)
 *
 * @template TRelatedModel of \Illuminate\Database\Eloquent\Model
 * @template TDeclaringModel of \Illuminate\Database\Eloquent\Model
 *
 * @extends MorphMany<TRelatedModel, TDeclaringModel>
 */
final class StringKeyMorphMany extends MorphMany
{
    /** Evita `whereIntegerInRaw`: el valor se bindea en vez de incrustarse crudo. */
    protected function whereInMethod(Model $model, $key)
    {
        return 'whereIn';
    }

    /** Lazy / addConstraints / updateOrCreate: `translatable_id = '18'` (PARAM_STR). */
    public function getParentKey()
    {
        return (string) parent::getParentKey();
    }

    /**
     * Eager: `translatable_id in ('18', …)` con valores string.
     *
     * @param  array<int, Model>  $models
     */
    protected function getKeys(array $models, $key = null)
    {
        return array_map(
            static fn ($value): string => (string) $value,
            parent::getKeys($models, $key),
        );
    }
}
