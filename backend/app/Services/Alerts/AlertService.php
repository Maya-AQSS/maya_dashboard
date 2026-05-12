<?php

namespace App\Services\Alerts;

use App\Models\Alert;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Services\Contracts\AlertServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class AlertService implements AlertServiceInterface
{
    public function __construct(
        private readonly AlertRepositoryInterface $alerts,
    ) {}

    public function paginate(bool $activeOnly, ?string $severity, int $perPage): LengthAwarePaginator
    {
        return $this->alerts->paginate($activeOnly, $severity, $perPage);
    }

    public function acknowledge(int $alertId, string $userId): Alert
    {
        return $this->alerts->acknowledge(
            $this->alerts->findOrFail($alertId),
            $userId,
        );
    }

    public function resolve(int $alertId, string $userId): Alert
    {
        return $this->alerts->resolve(
            $this->alerts->findOrFail($alertId),
            $userId,
        );
    }
}
