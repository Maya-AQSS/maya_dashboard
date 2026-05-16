<?php

namespace App\Services\Alerts;

use App\DTOs\AlertDto;
use Maya\Http\Pagination\PaginatedDto;
use App\Models\Alert;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Services\Contracts\AlertServiceInterface;

final class AlertService implements AlertServiceInterface
{
    public function __construct(
        private readonly AlertRepositoryInterface $alerts,
    ) {}

    /**
     * @return PaginatedDto<AlertDto>
     */
    public function paginate(bool $activeOnly, ?string $severity, int $perPage): PaginatedDto
    {
        $paginator = $this->alerts->paginate($activeOnly, $severity, $perPage);

        return PaginatedDto::fromPaginator(
            $paginator,
            fn (Alert $alert): AlertDto => AlertDto::fromModel($alert),
        );
    }

    public function acknowledge(int $alertId, string $userId): AlertDto
    {
        return AlertDto::fromModel($this->alerts->acknowledge(
            $this->alerts->findOrFail($alertId),
            $userId,
        ));
    }

    public function resolve(int $alertId, string $userId): AlertDto
    {
        return AlertDto::fromModel($this->alerts->resolve(
            $this->alerts->findOrFail($alertId),
            $userId,
        ));
    }
}
