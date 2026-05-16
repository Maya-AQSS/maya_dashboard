<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ApplicationRepositoryInterface
{
    /**
     * Listado de aplicaciones activas anotadas con `is_favorite` para el usuario indicado.
     *
     * @return Collection<int, \App\Models\Application>
     */
    public function listActiveWithFavoriteFlag(string $userId): Collection;

    /**
     * Variante paginada de listActiveWithFavoriteFlag.
     *
     * @return LengthAwarePaginator<\App\Models\Application>
     */
    public function paginateActiveWithFavoriteFlag(string $userId, int $perPage = 100): LengthAwarePaginator;
}
