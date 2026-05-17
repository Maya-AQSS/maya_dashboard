<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Application;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserFavoriteApplicationRepositoryInterface
{
    /**
     * Favoritos del usuario, paginados.
     *
     * @return LengthAwarePaginator<Application>
     */
    public function paginateForUser(User $user, int $perPage = 100): LengthAwarePaginator;

    public function attach(User $user, int $applicationId): Application;

    /**
     * Devuelve el número de favoritos detached (0 si no existía).
     */
    public function detach(User $user, int $applicationId): int;
}
