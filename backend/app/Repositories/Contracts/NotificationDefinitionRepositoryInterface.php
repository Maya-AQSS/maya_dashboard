<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\NotificationDefinition;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface NotificationDefinitionRepositoryInterface
{
    /**
     * @return Collection<int, NotificationDefinition>
     */
    public function list(?string $category, ?string $sourceApp): Collection;

    /**
     * @return Paginator<NotificationDefinition>
     */
    public function paginateWithFilters(int $page, int $perPage, ?string $category = null, ?string $sourceApp = null, ?string $search = null, string $sortBy = 'label', string $sortDir = 'asc'): Paginator;

    public function findOrFail(int $id): NotificationDefinition;

    public function findByKey(string $key): ?NotificationDefinition;

    public function update(NotificationDefinition $definition, array $attributes): NotificationDefinition;

    /**
     * Map of every known definition key → enabled flag (cached). Unknown keys
     * are absent from the map and treated as enabled by callers.
     *
     * @return array<string, bool>
     */
    public function enabledKeyMap(): array;
}
