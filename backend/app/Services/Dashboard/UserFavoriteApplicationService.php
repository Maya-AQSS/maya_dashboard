<?php
declare(strict_types=1);

namespace App\Services\Dashboard;

use App\DTOs\UserFavoriteApplicationDto;
use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class UserFavoriteApplicationService implements UserFavoriteApplicationServiceInterface
{
    public function __construct(
        private readonly UserFavoriteApplicationRepositoryInterface $favorites,
    ) {}

    /**
     * @return LengthAwarePaginator<UserFavoriteApplicationDto>
     */
    public function list(User $user, int $perPage = 100): LengthAwarePaginator
    {
        $paginator = $this->favorites->paginateForUser($user, $perPage);

        $paginator->getCollection()->transform(
            fn (Application $app): UserFavoriteApplicationDto => UserFavoriteApplicationDto::fromModel($app),
        );

        return $paginator;
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
