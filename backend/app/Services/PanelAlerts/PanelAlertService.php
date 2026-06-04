<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\DTOs\AlertAudienceDto;
use App\DTOs\PanelAlertDto;
use App\Models\PanelAlert;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\PanelAlertServiceInterface;
use Illuminate\Support\Carbon;
use Maya\Http\Pagination\PaginatedDto;

final class PanelAlertService implements PanelAlertServiceInterface
{
    public function __construct(
        private readonly PanelAlertRepositoryInterface $alerts,
        private readonly AlertAudienceServiceInterface $audience,
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
    public function activeForWidget(int $limit, string $userId): array
    {
        return $this->alerts->activeNow($limit, $userId)
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
        $attributes = $this->audience->attributesForPersist($createdBy, $data);
        $attributes = $this->applyVisibilityWindow($attributes);

        return PanelAlertDto::fromModel(
            $this->alerts->create(array_merge($attributes, ['created_by' => $createdBy])),
        );
    }

    public function update(int $id, array $data, string $updatedBy): PanelAlertDto
    {
        $alert = $this->alerts->findOrFail($id);
        $attributes = $this->audience->attributesForUpdate(
            $updatedBy,
            $data,
            AlertAudienceDto::fromModel($alert),
        );
        $attributes = $this->applyVisibilityWindow($attributes, $alert);

        return PanelAlertDto::fromModel(
            $this->alerts->update($alert, $attributes),
        );
    }

    /**
     * Fix B2: derive visible_until from duration_minutes when an explicit
     * visible_until is not provided. Works on both create and update (the
     * latter resolving visible_from from the existing row when unchanged).
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function applyVisibilityWindow(array $attributes, ?PanelAlert $current = null): array
    {
        $duration = $attributes['duration_minutes'] ?? $current?->duration_minutes;

        // Explicit visible_until wins; only auto-compute when absent.
        $hasExplicitUntil = array_key_exists('visible_until', $attributes)
            && $attributes['visible_until'] !== null;

        if ($duration === null || $hasExplicitUntil) {
            return $attributes;
        }

        $from = $attributes['visible_from'] ?? $current?->visible_from;
        if ($from === null) {
            return $attributes;
        }

        $attributes['visible_until'] = Carbon::parse($from)->addMinutes((int) $duration);

        return $attributes;
    }

    public function delete(int $id): void
    {
        $this->alerts->delete($this->alerts->findOrFail($id));
    }
}
