<?php

declare(strict_types=1);

namespace App\Support\Search;

use Illuminate\Contracts\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;
use Maya\Search\AccentFold;

/**
 * Aplica el filtro de búsqueda accent-insensitive estándar Maya
 * (Maya\Search\AccentFold de shared-http-laravel) sobre un conjunto
 * de columnas/expresiones SQL confiables.
 *
 * CAMBIO FUNCIONAL respecto al `ilike` previo: la búsqueda ahora ignora
 * acentos en ambos lados ("María" encuentra "maria" y viceversa) y escapa
 * los comodines `%`/`_` del término — ver changes.md.
 */
final class AccentSearch
{
    /**
     * Añade un grupo `where(... OR ...)` accent-folded al query.
     *
     * @param  EloquentBuilder<Model>|QueryBuilder  $query
     * @param  list<string>  $expressions  Columnas o expresiones SQL CONFIABLES
     *                                     (nunca derivadas de input de usuario).
     */
    public static function apply(EloquentBuilder|QueryBuilder $query, array $expressions, string $search): void
    {
        $needle = AccentFold::fold($search);

        if ($needle === '') {
            return;
        }

        $like = '%'.AccentFold::escapeLike($needle).'%';
        $driver = $query->getConnection()->getDriverName();

        $query->where(static function ($q) use ($expressions, $like, $driver): void {
            foreach ($expressions as $expression) {
                [$expr, $bindings] = AccentFold::sqlFoldedLowerExpression($expression, $driver);
                $q->orWhereRaw("{$expr} LIKE ?", [...$bindings, $like]);
            }
        });
    }
}
