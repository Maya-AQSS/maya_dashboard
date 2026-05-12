<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface ApplicationRepositoryInterface
{
    /**
     * Listado de aplicaciones activas anotadas con `is_favorite` para el usuario indicado.
     *
     * @return Collection<int, \App\Models\Application>
     */
    public function listActiveWithFavoriteFlag(string $userId): Collection;
}
