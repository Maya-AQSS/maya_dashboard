<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\ApplicationDto;
use Maya\Http\Pagination\PaginatedDto;

interface ApplicationServiceInterface
{
    /**
     * @return PaginatedDto<ApplicationDto>
     */
    public function listForUser(string $userId, int $perPage = 100): PaginatedDto;

    /**
     * List applications for a user with server-side filtering, sorting, and pagination.
     *
     * @param string $userId
     * @param int $page Current page (1-based)
     * @param int $perPage Items per page
     * @param string|null $search Search query (name/description)
     * @param string|null $favorite Filter: 'yes' or 'no'
     * @param string $sortBy Sort column: 'name', 'description', 'updated_at'
     * @param string $sortDir Sort direction: 'asc' or 'desc'
     * @return PaginatedDto<ApplicationDto>
     */
    public function listForUserWithFilters(
        string $userId,
        int $page,
        int $perPage,
        ?string $search = null,
        ?string $favorite = null,
        string $sortBy = 'name',
        string $sortDir = 'asc',
    ): PaginatedDto;
}
