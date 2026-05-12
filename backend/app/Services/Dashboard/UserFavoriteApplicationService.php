<?php

namespace App\Services\Dashboard;

use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use Illuminate\Database\Eloquent\Collection;

final class UserFavoriteApplicationService implements UserFavoriteApplicationServiceInterface
{
    public function __construct(
        private readonly UserFavoriteApplicationRepositoryInterface $favorites,
    ) {}

    public function list(User $user): Collection
    {
        return $this->favorites->listForUser($user);
    }

    public function add(User $user, int $applicationId): Application
    {
        return $this->favorites->attach($user, $applicationId);
    }

    public function remove(User $user, int $applicationId): void
    {
        $this->favorites->detach($user, $applicationId);
    }
}
