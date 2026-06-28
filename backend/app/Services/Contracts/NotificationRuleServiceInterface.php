<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\NotificationRuleDto;
use Maya\Http\Pagination\PaginatedDto;

interface NotificationRuleServiceInterface
{
    /**
     * @return PaginatedDto<NotificationRuleDto>
     */
    public function paginate(int $perPage, ?string $sourceApp, ?string $evaluatorKey): PaginatedDto;

    /**
     * @return PaginatedDto<NotificationRuleDto>
     */
    public function paginateWithFilters(int $page, int $perPage, ?string $sourceApp = null, ?string $evaluatorKey = null, ?string $search = null, string $sortBy = 'name', string $sortDir = 'asc'): PaginatedDto;

    public function find(int $id): NotificationRuleDto;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, string $createdBy): NotificationRuleDto;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data, string $updatedBy): NotificationRuleDto;

    public function delete(int $id): void;
}
