<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\DTOs\UserFavoriteApplicationDto;
use App\Models\Application;
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
    public function list(string $userId, int $perPage = 100): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->favorites->paginateForUser($userId, $perPage),
            fn (Application $app): UserFavoriteApplicationDto => UserFavoriteApplicationDto::fromModel($app),
        );
    }

    public function add(string $userId, int $applicationId): UserFavoriteApplicationDto
    {
        return UserFavoriteApplicationDto::fromModel($this->favorites->attach($userId, $applicationId));
    }

    public function remove(string $userId, int $applicationId): void
    {
        $detached = $this->favorites->detach($userId, $applicationId);

        if ($detached === 0) {
            throw new NotFoundHttpException('Favorite application not found.');
        }
    }
}
