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
}
