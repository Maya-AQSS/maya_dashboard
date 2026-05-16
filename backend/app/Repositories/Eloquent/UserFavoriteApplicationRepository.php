<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class UserFavoriteApplicationRepository implements UserFavoriteApplicationRepositoryInterface
{
    public function paginateForUser(User $user, int $perPage = 100): LengthAwarePaginator
    {
        return $user->favoriteApplications()->paginate($perPage);
    }

    public function attach(User $user, int $applicationId): Application
    {
        $user->favoriteApplications()->syncWithoutDetaching([$applicationId]);

        return $user->favoriteApplications()->findOrFail($applicationId);
    }

    public function detach(User $user, int $applicationId): void
    {
        $user->favoriteApplications()->detach($applicationId);
    }
}
