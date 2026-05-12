<?php

namespace App\Services\Dashboard;

use App\Models\User;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Services\Contracts\ApplicationServiceInterface;
use Illuminate\Database\Eloquent\Collection;

final class ApplicationService implements ApplicationServiceInterface
{
    public function __construct(
        private readonly ApplicationRepositoryInterface $applications,
    ) {}

    public function listForUser(User $user): Collection
    {
        return $this->applications->listActiveWithFavoriteFlag((string) $user->id);
    }
}
