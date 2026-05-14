<?php

namespace App\Services\Dashboard;

use App\DataTransferObjects\ApplicationDto;
use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Services\Contracts\ApplicationServiceInterface;

final class ApplicationService implements ApplicationServiceInterface
{
    public function __construct(
        private readonly ApplicationRepositoryInterface $applications,
    ) {}

    /**
     * @return list<ApplicationDto>
     */
    public function listForUser(User $user): array
    {
        return $this->applications->listActiveWithFavoriteFlag((string) $user->id)
            ->map(fn (Application $app): ApplicationDto => ApplicationDto::fromModel($app))
            ->values()
            ->all();
    }
}
