<?php

namespace App\Services\Dashboard;

use App\Models\User;
use App\Models\UserDashboardLayout;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;

final class UserDashboardLayoutService implements UserDashboardLayoutServiceInterface
{
    public function __construct(
        private readonly UserDashboardLayoutRepositoryInterface $layouts,
    ) {}

    public function getOrMake(User $user): UserDashboardLayout
    {
        return $this->layouts->getOrMake($user);
    }

    public function save(User $user, array $layout): UserDashboardLayout
    {
        return $this->layouts->upsert($user, $layout);
    }
}
