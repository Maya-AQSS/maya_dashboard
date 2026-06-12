<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\NotificationDefinition;
use App\Repositories\Contracts\NotificationDefinitionRepositoryInterface;
use App\Support\Search\AccentSearch;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

final class NotificationDefinitionRepository implements NotificationDefinitionRepositoryInterface
{
    /**
     * @return Collection<int, NotificationDefinition>
     */
    public function list(?string $category, ?string $sourceApp): Collection
    {
        return NotificationDefinition::query()
            ->when($category !== null, fn ($q) => $q->where('category', $category))
            ->when($sourceApp !== null, fn ($q) => $q->where('source_app', $sourceApp))
            ->orderBy('source_app')
            ->orderBy('key')
            ->get();
    }

    public function paginateWithFilters(int $page, int $perPage, ?string $category = null, ?string $sourceApp = null, ?string $search = null, string $sortBy = 'label', string $sortDir = 'asc'): LengthAwarePaginator
    {
        $query = NotificationDefinition::query();

        if ($category !== null) {
            $query->where('category', $category);
        }

        if ($sourceApp !== null) {
            $query->where('source_app', $sourceApp);
        }

        if ($search !== null) {
            // Búsqueda accent-insensitive — ver changes.md.
            AccentSearch::apply($query, ['label', 'key', 'source_app'], $search);
        }

        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function findOrFail(int $id): NotificationDefinition
    {
        return NotificationDefinition::query()->findOrFail($id);
    }

    public function findByKey(string $key): ?NotificationDefinition
    {
        return NotificationDefinition::query()->where('key', $key)->first();
    }

    public function update(NotificationDefinition $definition, array $attributes): NotificationDefinition
    {
        $definition->update($attributes);

        return $definition->refresh();
    }

    /**
     * @return array<string, bool>
     */
    public function enabledKeyMap(): array
    {
        return Cache::remember(
            NotificationDefinition::ENABLED_KEYS_CACHE,
            now()->addMinutes(5),
            static fn (): array => NotificationDefinition::query()
                ->pluck('enabled', 'key')
                ->map(static fn ($enabled): bool => (bool) $enabled)
                ->all(),
        );
    }
}
