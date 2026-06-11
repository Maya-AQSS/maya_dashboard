<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\NotificationDefinitionDto;
use App\Repositories\Contracts\NotificationDefinitionRepositoryInterface;
use App\Services\Contracts\NotificationDefinitionServiceInterface;
use Illuminate\Support\Collection;
use Maya\Http\Pagination\PaginatedDto;

final class NotificationDefinitionService implements NotificationDefinitionServiceInterface
{
    public function __construct(
        private readonly NotificationDefinitionRepositoryInterface $definitions,
    ) {}

    /**
     * @return Collection<int, NotificationDefinitionDto>
     */
    public function list(?string $category = null, ?string $sourceApp = null): Collection
    {
        return $this->definitions->list($category, $sourceApp)
            ->map(fn ($model) => NotificationDefinitionDto::fromModel($model))
            ->values();
    }

    /**
     * @return PaginatedDto<NotificationDefinitionDto>
     */
    public function paginate(int $page, int $perPage, ?string $category = null, ?string $sourceApp = null, ?string $search = null, string $sortBy = 'label', string $sortDir = 'asc'): PaginatedDto
    {
        $paginated = $this->definitions->paginateWithFilters($page, $perPage, $category, $sourceApp, $search, $sortBy, $sortDir);

        return $paginated->mapItems(fn ($model) => NotificationDefinitionDto::fromModel($model));
    }

    public function setEnabled(int $id, bool $enabled): NotificationDefinitionDto
    {
        $model = $this->definitions->findOrFail($id);

        return NotificationDefinitionDto::fromModel(
            $this->definitions->update($model, ['enabled' => $enabled]),
        );
    }

    public function findByKey(string $key): ?NotificationDefinitionDto
    {
        $model = $this->definitions->findByKey($key);

        return $model !== null ? NotificationDefinitionDto::fromModel($model) : null;
    }

    public function isKeyEnabled(string $key): bool
    {
        // Unknown key (no definition row) → allowed; known key → honour the flag.
        return $this->definitions->enabledKeyMap()[$key] ?? true;
    }
}
