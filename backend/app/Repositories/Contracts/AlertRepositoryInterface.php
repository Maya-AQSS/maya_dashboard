<?php

namespace App\Repositories\Contracts;

use App\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<Alert>
     */
    public function paginate(bool $activeOnly, ?string $severity, int $perPage): LengthAwarePaginator;

    public function findOrFail(int $alertId): Alert;

    public function acknowledge(Alert $alert, string $userId): Alert;

    public function resolve(Alert $alert, string $userId): Alert;
}
