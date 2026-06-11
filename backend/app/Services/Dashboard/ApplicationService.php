<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\DTOs\ApplicationDto;
use App\Models\Application;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Services\Contracts\ApplicationServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class ApplicationService implements ApplicationServiceInterface
{
    public function __construct(
        private readonly ApplicationRepositoryInterface $applications,
    ) {}

    /**
     * @return PaginatedDto<ApplicationDto>
     */
    public function listForUser(string $userId, int $perPage = 100): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->applications->paginateActiveWithFavoriteFlag($userId, $perPage),
            fn (Application $app): ApplicationDto => ApplicationDto::fromModel($app),
        );
    }

    /**
     * @return PaginatedDto<ApplicationDto>
     */
    public function listForUserWithFilters(
        string $userId,
        int $page,
        int $perPage,
        ?string $search = null,
        ?string $favorite = null,
        string $sortBy = 'name',
        string $sortDir = 'asc',
    ): PaginatedDto {
        return PaginatedDto::fromPaginator(
            $this->applications->paginateActiveWithFilters(
                $userId,
                $page,
                $perPage,
                $search,
                $favorite,
                $sortBy,
                $sortDir,
            ),
            fn (Application $app): ApplicationDto => ApplicationDto::fromModel($app),
        );
    }
}
