<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AlertDto;
use Maya\Http\Pagination\PaginatedDto;

interface AlertServiceInterface
{
    /**
     * @return PaginatedDto<AlertDto>
     */
    public function paginate(bool $activeOnly, ?string $severity, int $perPage): PaginatedDto;

    public function acknowledge(int $alertId, string $userId): AlertDto;

    public function resolve(int $alertId, string $userId): AlertDto;
}
