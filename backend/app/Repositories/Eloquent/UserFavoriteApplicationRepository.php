<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class UserFavoriteApplicationRepository implements UserFavoriteApplicationRepositoryInterface
{
    public function paginateForUser(string $userId, int $perPage = 100): LengthAwarePaginator
    {
        $user = User::query()->findOrFail($userId);

        return $user->favoriteApplications()->paginate($perPage);
    }

    public function attach(string $userId, int $applicationId): Application
    {
        $user = User::query()->findOrFail($userId);
        $user->favoriteApplications()->syncWithoutDetaching([$applicationId]);

        return $user->favoriteApplications()->findOrFail($applicationId);
    }

    public function detach(string $userId, int $applicationId): int
    {
        $user = User::query()->findOrFail($userId);

        return $user->favoriteApplications()->detach($applicationId);
    }
}
