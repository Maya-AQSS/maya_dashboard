<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\DTOs\PanelAlertDto;
use App\Models\PanelAlert;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use App\Services\Contracts\PanelAlertServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class PanelAlertService implements PanelAlertServiceInterface
{
    public function __construct(
        private readonly PanelAlertRepositoryInterface $alerts,
    ) {}

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
    ): PaginatedDto {
        $paginator = $this->alerts->paginate($perPage, $severity, $search, $includeExpired, $sortBy, $sortDir);

        return PaginatedDto::fromPaginator(
            $paginator,
            fn (PanelAlert $alert): PanelAlertDto => PanelAlertDto::fromModel($alert),
        );
    }

    /**
     * @return list<PanelAlertDto>
     */
    public function activeForWidget(int $limit): array
    {
        return $this->alerts->activeNow($limit)
            ->map(fn (PanelAlert $alert): PanelAlertDto => PanelAlertDto::fromModel($alert))
            ->values()
            ->all();
    }

    public function find(int $id): PanelAlertDto
    {
        return PanelAlertDto::fromModel($this->alerts->findOrFail($id));
    }

    public function create(array $data, string $createdBy): PanelAlertDto
    {
        return PanelAlertDto::fromModel(
            $this->alerts->create(array_merge($data, ['created_by' => $createdBy])),
        );
    }

    public function update(int $id, array $data): PanelAlertDto
    {
        return PanelAlertDto::fromModel(
            $this->alerts->update($this->alerts->findOrFail($id), $data),
        );
    }

    public function delete(int $id): void
    {
        $this->alerts->delete($this->alerts->findOrFail($id));
    }
}
