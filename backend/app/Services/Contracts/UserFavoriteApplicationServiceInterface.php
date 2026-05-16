<?php

namespace App\Services\Contracts;

use App\DTOs\UserFavoriteApplicationDto;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserFavoriteApplicationServiceInterface
{
    /**
     * @return LengthAwarePaginator<UserFavoriteApplicationDto>
     */
    public function list(User $user, int $perPage = 100): LengthAwarePaginator;

    public function add(User $user, int $applicationId): UserFavoriteApplicationDto;

    public function remove(User $user, int $applicationId): void;
}
