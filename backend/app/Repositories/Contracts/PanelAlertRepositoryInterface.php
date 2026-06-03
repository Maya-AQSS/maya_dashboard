<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\PanelAlert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PanelAlertRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<PanelAlert>
     */
    public function paginate(
        int $perPage,
        ?string $severity,
        ?string $search,
        bool $includeExpired,
        string $sortBy,
        string $sortDir,
    ): LengthAwarePaginator;

    /**
     * Returns currently-visible panel alerts: visible_from <= now AND (visible_until IS NULL OR visible_until >= now).
     *
     * @return Collection<int, PanelAlert>
     */
    public function activeNow(int $limit, string $userId): Collection;

    public function findOrFail(int $id): PanelAlert;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): PanelAlert;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(PanelAlert $alert, array $attributes): PanelAlert;

    public function delete(PanelAlert $alert): void;
}
