<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Application;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ApplicationRepositoryInterface
{
    /**
     * Listado paginado de aplicaciones activas anotadas con `is_favorite` para el usuario indicado.
     *
     * @return LengthAwarePaginator<Application>
     */
    public function paginateActiveWithFavoriteFlag(string $userId, int $perPage = 100): LengthAwarePaginator;
}
