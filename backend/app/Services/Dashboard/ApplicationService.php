<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\DTOs\ApplicationDto;
use App\Models\Application;
use App\Models\User;
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
    public function listForUser(User $user, int $perPage = 100): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->applications->paginateActiveWithFavoriteFlag((string) $user->id, $perPage),
            fn (Application $app): ApplicationDto => ApplicationDto::fromModel($app),
        );
    }
}
