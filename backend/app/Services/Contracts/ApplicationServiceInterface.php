<?php
declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\ApplicationDto;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ApplicationServiceInterface
{
    /**
     * @return LengthAwarePaginator<ApplicationDto>
     */
    public function listForUser(User $user, int $perPage = 100): LengthAwarePaginator;
}
