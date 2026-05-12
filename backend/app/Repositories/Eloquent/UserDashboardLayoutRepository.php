<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Models\UserDashboardLayout;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;

final class UserDashboardLayoutRepository implements UserDashboardLayoutRepositoryInterface
{
    public function getOrMake(User $user): UserDashboardLayout
    {
        return $user->dashboardLayout ?? $user->dashboardLayout()->make(['layout' => []]);
    }

    public function upsert(User $user, array $layout): UserDashboardLayout
    {
        return $user->dashboardLayout()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'layout'     => $layout,
                'updated_at' => now(),
            ],
        );
    }
}
