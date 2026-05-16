<?php

namespace App\Services\Contracts;

use App\DTOs\UserDashboardLayoutDto;
use App\Models\User;

interface UserDashboardLayoutServiceInterface
{
    public function getOrMake(User $user): UserDashboardLayoutDto;

    /**
     * @param  array<int, mixed>  $layout
     */
    public function save(User $user, array $layout): UserDashboardLayoutDto;
}
