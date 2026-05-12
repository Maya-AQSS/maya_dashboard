<?php

namespace App\Services\Contracts;

use App\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertServiceInterface
{
    /**
     * @return LengthAwarePaginator<Alert>
     */
    public function paginate(bool $activeOnly, ?string $severity, int $perPage): LengthAwarePaginator;

    public function acknowledge(int $alertId, string $userId): Alert;

    public function resolve(int $alertId, string $userId): Alert;
}
