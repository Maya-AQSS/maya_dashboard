<?php

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\User;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

final class UserFavoriteApplicationRepository implements UserFavoriteApplicationRepositoryInterface
{
    public function listForUser(User $user): Collection
    {
        return $user->favoriteApplications()->get();
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
