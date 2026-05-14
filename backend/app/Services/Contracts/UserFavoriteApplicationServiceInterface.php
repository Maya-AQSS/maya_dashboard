<?php

namespace App\Services\Contracts;

use App\DataTransferObjects\UserFavoriteApplicationDto;
use App\Models\User;

interface UserFavoriteApplicationServiceInterface
{
    /**
     * @return list<UserFavoriteApplicationDto>
     */
    public function list(User $user): array;

    public function add(User $user, int $applicationId): UserFavoriteApplicationDto;

    public function remove(User $user, int $applicationId): void;
}
