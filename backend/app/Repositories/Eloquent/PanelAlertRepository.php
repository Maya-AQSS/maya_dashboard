<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\AlertAudienceDto;
use App\DTOs\PanelAlertDto;
use App\Models\PanelAlert;
use App\Repositories\Contracts\AlertAudienceRepositoryInterface;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

final class PanelAlertRepository implements PanelAlertRepositoryInterface
{
    public function __construct(
        private readonly AlertAudienceRepositoryInterface $audience,
    ) {}

    public function paginate(
        int $perPage,
        ?string $severity,
        ?string $search,
        bool $includeExpired,
        string $sortBy,
        string $sortDir,
    ): LengthAwarePaginator {
        $query = PanelAlert::query()->with('rule');

        if (! $includeExpired) {
            $query->active();
        }

        if ($severity !== null && $severity !== '') {
            $query->where('severity', $severity);
        }

        if ($search !== null && $search !== '') {
            $query->where('text', 'ilike', '%'.$search.'%');
        }

        $allowedSortColumns = ['visible_from', 'created_at', 'severity'];
        $column = in_array($sortBy, $allowedSortColumns, true) ? $sortBy : 'created_at';
        $direction = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($column, $direction);

        return $query->paginate($perPage);
    }

    /**
     * @return Collection<int, PanelAlert>
     */
    public function activeNow(int $limit, string $userId): Collection
    {
        return PanelAlert::query()
            ->active()
            ->orderByDesc('visible_from')
            ->limit($limit * 3)
            ->get()
            ->filter(function (PanelAlert $alert) use ($userId): bool {
                return $this->audience->userMatchesAudience($userId, AlertAudienceDto::fromModel($alert));
            })
            ->take($limit)
            ->values();
    }

    public function findOrFail(int $id): PanelAlert
    {
        return PanelAlert::findOrFail($id);
    }

    public function findDtoOrFail(int $id): PanelAlertDto
    {
        return PanelAlertDto::fromModel($this->findOrFail($id));
    }

    public function create(array $attributes): PanelAlert
    {
        return PanelAlert::create($attributes);
    }

    public function update(PanelAlert $alert, array $attributes): PanelAlert
    {
        $alert->update($attributes);

        return $alert->refresh();
    }

    public function delete(PanelAlert $alert): void
    {
        $alert->delete();
    }
}
