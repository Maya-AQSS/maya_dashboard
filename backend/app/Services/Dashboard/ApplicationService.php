<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\DTOs\ApplicationDto;
use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Services\Contracts\ApplicationServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ApplicationService implements ApplicationServiceInterface
{
    public function __construct(
        private readonly ApplicationRepositoryInterface $applications,
    ) {}

    /**
     * @return LengthAwarePaginator<ApplicationDto>
     */
    public function listForUser(User $user, int $perPage = 100): LengthAwarePaginator
    {
        $paginator = $this->applications->paginateActiveWithFavoriteFlag((string) $user->id, $perPage);

        $paginator->getCollection()->transform(
            fn (Application $app): ApplicationDto => ApplicationDto::fromModel($app),
        );

        return $paginator;
    }
}
