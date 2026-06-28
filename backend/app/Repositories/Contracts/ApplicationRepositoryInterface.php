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

    /**
     * Listado paginado con filtros server-side.
     *
     * @param  int  $page  Current page (1-based)
     * @param  int  $perPage  Items per page
     * @param  string|null  $search  Search query
     * @param  string|null  $favorite  Filter: 'yes' or 'no'
     * @param  string  $sortBy  Sort column
     * @param  string  $sortDir  Sort direction
     * @return LengthAwarePaginator<Application>
     */
    public function paginateActiveWithFilters(
        string $userId,
        int $page,
        int $perPage,
        ?string $search = null,
        ?string $favorite = null,
        string $sortBy = 'name',
        string $sortDir = 'asc',
    ): LengthAwarePaginator;
}
