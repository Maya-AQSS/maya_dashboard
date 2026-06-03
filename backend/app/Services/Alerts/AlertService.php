<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DTOs\AlertDto;
use App\DTOs\AlertFilterDto;
use App\Models\Alert;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Services\Contracts\AlertServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class AlertService implements AlertServiceInterface
{
    public function __construct(
        private readonly AlertRepositoryInterface $alerts,
    ) {}

    /**
     * @return PaginatedDto<AlertDto>
     */
    public function paginate(AlertFilterDto $filter): PaginatedDto
    {
        $paginator = $this->alerts->paginate($filter);

        return PaginatedDto::fromPaginator(
            $paginator,
            fn (Alert $alert): AlertDto => AlertDto::fromModel($alert),
        );
    }

    public function acknowledge(int $alertId, string $userId): AlertDto
    {
        return AlertDto::fromModel($this->alerts->acknowledge($alertId, $userId));
    }

    public function resolve(int $alertId, string $userId): AlertDto
    {
        return AlertDto::fromModel($this->alerts->resolve($alertId, $userId));
    }
}
