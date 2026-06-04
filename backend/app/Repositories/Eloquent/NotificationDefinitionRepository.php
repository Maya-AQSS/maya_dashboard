<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\NotificationDefinition;
use App\Repositories\Contracts\NotificationDefinitionRepositoryInterface;
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
