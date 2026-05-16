<?php
declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ApplicationRepository implements ApplicationRepositoryInterface
{
    public function paginateActiveWithFavoriteFlag(string $userId, int $perPage = 100): LengthAwarePaginator
    {
        return $this->activeWithFavoriteFlagQuery($userId)->paginate($perPage);
    }

    private function activeWithFavoriteFlagQuery(string $userId)
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
            ->orderBy('applications.name');
    }
}
