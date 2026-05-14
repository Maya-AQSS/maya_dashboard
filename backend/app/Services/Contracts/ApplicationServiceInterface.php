<?php

namespace App\Services\Contracts;

use App\DataTransferObjects\ApplicationDto;
use App\Models\User;

interface ApplicationServiceInterface
{
    /**
     * @return list<ApplicationDto>
     */
    public function listForUser(User $user): array;
}
