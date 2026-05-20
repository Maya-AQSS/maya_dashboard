<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\UserFavoriteApplicationDto;
use App\Models\User;
use Maya\Http\Pagination\PaginatedDto;

interface UserFavoriteApplicationServiceInterface
{
    /**
     * @return PaginatedDto<UserFavoriteApplicationDto>
     */
    public function list(User $user, int $perPage = 100): PaginatedDto;

    public function add(User $user, int $applicationId): UserFavoriteApplicationDto;

    public function remove(User $user, int $applicationId): void;
}
