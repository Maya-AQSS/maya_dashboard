<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\UserFavoriteApplicationDto;
use Maya\Http\Pagination\PaginatedDto;

interface UserFavoriteApplicationServiceInterface
{
    /**
     * @return PaginatedDto<UserFavoriteApplicationDto>
     */
    public function list(string $userId, int $perPage = 100): PaginatedDto;

    public function add(string $userId, int $applicationId): UserFavoriteApplicationDto;

    public function remove(string $userId, int $applicationId): void;
}
