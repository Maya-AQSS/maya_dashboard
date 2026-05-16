<?php

namespace App\Services\Dashboard;

use App\DTOs\UserDashboardLayoutDto;
use App\Models\User;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;

final class UserDashboardLayoutService implements UserDashboardLayoutServiceInterface
{
    public function __construct(
        private readonly UserDashboardLayoutRepositoryInterface $layouts,
    ) {}

    public function getOrMake(User $user): UserDashboardLayoutDto
    {
        return UserDashboardLayoutDto::fromModel($this->layouts->getOrMake($user));
    }

    public function save(User $user, array $layout): UserDashboardLayoutDto
    {
        return UserDashboardLayoutDto::fromModel($this->layouts->upsert($user, $layout));
    }
}
