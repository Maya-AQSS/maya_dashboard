<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\NotificationDefinitionDto;
use Illuminate\Support\Collection;
use Maya\Http\Pagination\PaginatedDto;

interface NotificationDefinitionServiceInterface
{
    /**
     * @return Collection<int, NotificationDefinitionDto>
     */
    public function list(?string $category = null, ?string $sourceApp = null): Collection;

    /**
     * @return PaginatedDto<NotificationDefinitionDto>
     */
    public function paginate(int $page, int $perPage, ?string $category = null, ?string $sourceApp = null, ?string $search = null, string $sortBy = 'label', string $sortDir = 'asc'): PaginatedDto;

    public function setEnabled(int $id, bool $enabled): NotificationDefinitionDto;

    public function findByKey(string $key): ?NotificationDefinitionDto;

    /**
     * Whether a notification type should be delivered. Unknown keys (no
     * definition row) default to enabled.
     */
    public function isKeyEnabled(string $key): bool;
}
