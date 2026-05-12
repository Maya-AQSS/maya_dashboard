<?php

namespace App\Services\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface ApplicationServiceInterface
{
    /**
     * @return Collection<int, \App\Models\Application>
     */
    public function listForUser(User $user): Collection;
}
