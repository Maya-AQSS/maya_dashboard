<?php

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

final class ApplicationRepository implements ApplicationRepositoryInterface
{
    public function listActiveWithFavoriteFlag(string $userId): Collection
    {
        return Application::query()
            ->where('applications.is_active', true)
            ->leftJoin(
                'user_favorite_applications',
                fn ($join) => $join
                    ->on('user_favorite_applications.application_id', '=', 'applications.id')
                    ->where('user_favorite_applications.user_id', '=', $userId),
            )
            ->select('applications.*')
            ->selectRaw('user_favorite_applications.application_id IS NOT NULL as is_favorite')
            ->orderBy('applications.name')
            ->get();
    }
}
