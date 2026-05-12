<?php

namespace App\Repositories\Contracts;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserFavoriteApplicationRepositoryInterface
{
    /**
     * Favoritos del usuario.
     *
     * @return Collection<int, Application>
     */
    public function listForUser(User $user): Collection;

    public function attach(User $user, int $applicationId): Application;

    public function detach(User $user, int $applicationId): void;
}
