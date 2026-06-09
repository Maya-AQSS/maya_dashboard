<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Maya\Profile\Database\ViewPermissionGateQuery;

final class UserFavoriteApplicationRepository implements UserFavoriteApplicationRepositoryInterface
{
    public function paginateForUser(string $userId, int $perPage = 100): LengthAwarePaginator
    {
        $user = User::query()->findOrFail($userId);

        $favorites = $user->favoriteApplications();
        ViewPermissionGateQuery::apply($favorites->getQuery(), $userId);

        return $favorites->paginate($perPage);
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
