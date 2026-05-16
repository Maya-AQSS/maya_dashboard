<?php

namespace App\Repositories\Contracts;

use App\Models\Application;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserFavoriteApplicationRepositoryInterface
{
    /**
     * Favoritos del usuario.
     *
     * @return Collection<int, Application>
     */
    public function listForUser(User $user): Collection;

    /**
     * Variante paginada de listForUser.
     *
     * @return LengthAwarePaginator<Application>
     */
    public function paginateForUser(User $user, int $perPage = 100): LengthAwarePaginator;

    public function attach(User $user, int $applicationId): Application;

    public function detach(User $user, int $applicationId): void;
}
