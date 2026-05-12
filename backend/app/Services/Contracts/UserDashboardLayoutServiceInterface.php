<?php

namespace App\Services\Contracts;

use App\Models\User;
use App\Models\UserDashboardLayout;

interface UserDashboardLayoutServiceInterface
{
    public function getOrMake(User $user): UserDashboardLayout;

    /**
     * @param  array<int, mixed>  $layout
     */
    public function save(User $user, array $layout): UserDashboardLayout;
}
