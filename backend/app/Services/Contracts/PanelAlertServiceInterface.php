<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\PanelAlertDto;
use Maya\Http\Pagination\PaginatedDto;

interface PanelAlertServiceInterface
{
    /**
     * @return PaginatedDto<PanelAlertDto>
     */
    public function paginate(
        int $perPage,
        ?string $severity,
        ?string $search,
        bool $includeExpired,
        string $sortBy,
        string $sortDir,
    ): PaginatedDto;

    /**
     * Returns up to $limit currently-visible panel alerts for the dashboard widget.
     *
     * @return list<PanelAlertDto>
     */
    public function activeForWidget(int $limit): array;

    public function find(int $id): PanelAlertDto;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, string $createdBy): PanelAlertDto;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): PanelAlertDto;

    public function delete(int $id): void;
}
