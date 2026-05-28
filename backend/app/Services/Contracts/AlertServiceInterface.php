<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AlertDto;
use App\DTOs\AlertFilterDto;
use Maya\Http\Pagination\PaginatedDto;

interface AlertServiceInterface
{
    /**
     * @return PaginatedDto<AlertDto>
     */
    public function paginate(AlertFilterDto $filter): PaginatedDto;

    public function acknowledge(int $alertId, string $userId): AlertDto;

    public function resolve(int $alertId, string $userId): AlertDto;
}
