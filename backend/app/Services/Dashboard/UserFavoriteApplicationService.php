<?php

namespace App\Services\Dashboard;

use App\DataTransferObjects\UserFavoriteApplicationDto;
use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;

final class UserFavoriteApplicationService implements UserFavoriteApplicationServiceInterface
{
    public function __construct(
        private readonly UserFavoriteApplicationRepositoryInterface $favorites,
    ) {}

    /**
     * @return list<UserFavoriteApplicationDto>
     */
    public function list(User $user): array
    {
        return $this->favorites->listForUser($user)
            ->map(fn (Application $app): UserFavoriteApplicationDto => UserFavoriteApplicationDto::fromModel($app))
            ->values()
            ->all();
    }

    public function add(User $user, int $applicationId): UserFavoriteApplicationDto
    {
        return UserFavoriteApplicationDto::fromModel($this->favorites->attach($user, $applicationId));
    }

    public function remove(User $user, int $applicationId): void
    {
        $this->favorites->detach($user, $applicationId);
    }
}
