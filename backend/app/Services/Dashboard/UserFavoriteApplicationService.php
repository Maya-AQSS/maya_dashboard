<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\DTOs\UserFavoriteApplicationDto;
use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use Maya\Http\Pagination\PaginatedDto;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class UserFavoriteApplicationService implements UserFavoriteApplicationServiceInterface
{
    public function __construct(
        private readonly UserFavoriteApplicationRepositoryInterface $favorites,
    ) {}

    /**
     * @return PaginatedDto<UserFavoriteApplicationDto>
     */
    public function list(User $user, int $perPage = 100): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->favorites->paginateForUser($user, $perPage),
            fn (Application $app): UserFavoriteApplicationDto => UserFavoriteApplicationDto::fromModel($app),
        );
    }

    public function add(User $user, int $applicationId): UserFavoriteApplicationDto
    {
        return UserFavoriteApplicationDto::fromModel($this->favorites->attach($user, $applicationId));
    }

    public function remove(User $user, int $applicationId): void
    {
        $detached = $this->favorites->detach($user, $applicationId);

        if ($detached === 0) {
            throw new NotFoundHttpException('Favorite application not found.');
        }
    }
}
