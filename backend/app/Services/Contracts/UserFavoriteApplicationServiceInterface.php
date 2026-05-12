<?php

namespace App\Services\Contracts;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserFavoriteApplicationServiceInterface
{
    /**
     * @return Collection<int, Application>
     */
    public function list(User $user): Collection;

    public function add(User $user, int $applicationId): Application;

    public function remove(User $user, int $applicationId): void;
}
