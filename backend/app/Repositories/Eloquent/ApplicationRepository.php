<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Support\Search\AccentSearch;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Maya\Profile\Database\ViewPermissionGateQuery;

final class ApplicationRepository implements ApplicationRepositoryInterface
{
    public function paginateActiveWithFavoriteFlag(string $userId, int $perPage = 100): LengthAwarePaginator
    {
        return $this->activeWithFavoriteFlagQuery($userId)->paginate($perPage);
    }

    public function paginateActiveWithFilters(
        string $userId,
        int $page,
        int $perPage,
        ?string $search = null,
        ?string $favorite = null,
        string $sortBy = 'name',
        string $sortDir = 'asc',
    ): LengthAwarePaginator {
        $query = Application::query()->where('applications.is_active', true);
        ViewPermissionGateQuery::apply($query, $userId);

        $query = $query
            ->leftJoin(
                'user_favorite_applications',
                fn ($join) => $join
                    ->on('user_favorite_applications.application_id', '=', 'applications.id')
                    ->where('user_favorite_applications.user_id', '=', $userId),
            )
            ->select('applications.*')
            ->selectRaw('user_favorite_applications.application_id IS NOT NULL as is_favorite');

        // Search filter (accent-insensitive — ver changes.md)
        if ($search) {
            AccentSearch::apply($query, ['applications.name', 'applications.description'], $search);
        }

        // Favorite filter
        if ($favorite === 'yes') {
            $query = $query->where('user_favorite_applications.application_id', '!=', null);
        } elseif ($favorite === 'no') {
            $query = $query->whereNull('user_favorite_applications.application_id');
        }

        // Sort
        $orderColumn = match ($sortBy) {
            'description' => 'applications.description',
            'updated_at' => 'applications.updated_at',
            default => 'applications.name',
        };
        $query = $query->orderBy($orderColumn, $sortDir);

        return $query->paginate($perPage, page: $page);
    }

    private function activeWithFavoriteFlagQuery(string $userId)
    {
        $query = Application::query()->where('applications.is_active', true);
        ViewPermissionGateQuery::apply($query, $userId);

        return $query
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
