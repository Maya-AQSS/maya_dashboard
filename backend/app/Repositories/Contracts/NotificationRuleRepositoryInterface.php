<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\NotificationRule;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NotificationRuleRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<NotificationRule>
     */
    public function paginate(int $perPage, ?string $sourceApp, ?string $evaluatorKey): LengthAwarePaginator;

    /**
     * @return LengthAwarePaginator<NotificationRule>
     */
    public function paginateWithFilters(int $page, int $perPage, ?string $sourceApp = null, ?string $evaluatorKey = null, ?string $search = null, string $sortBy = 'name', string $sortDir = 'asc'): LengthAwarePaginator;

    public function findOrFail(int $id): NotificationRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): NotificationRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(NotificationRule $rule, array $attributes): NotificationRule;

    public function delete(NotificationRule $rule): void;
}
