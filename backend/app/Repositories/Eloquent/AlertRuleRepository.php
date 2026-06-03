<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\AlertRuleDto;
use App\DTOs\AlertRuleFilterDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use DateTimeInterface;
use Generator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class AlertRuleRepository implements AlertRuleRepositoryInterface
{
    public function paginate(AlertRuleFilterDto $filter): LengthAwarePaginator
    {
        $allowedSortColumns = ['slug', 'name', 'severity', 'created_at', 'last_evaluated_at'];
        $column = in_array($filter->sortBy, $allowedSortColumns, true) ? $filter->sortBy : 'slug';
        $direction = $filter->sortDir === 'asc' ? 'asc' : 'desc';

        $query = AlertRule::query()->orderBy($column, $direction);

        if ($filter->enabled !== null) {
            $query->where('enabled', $filter->enabled);
        }

        if ($filter->search !== null && $filter->search !== '') {
            $query->where(function ($q) use ($filter): void {
                $q->whereRaw('name ilike ?', ['%' . $filter->search . '%'])
                  ->orWhereRaw('slug ilike ?', ['%' . $filter->search . '%']);
            });
        }

        return $query->paginate($filter->perPage, page: $filter->page);
    }

    public function findOrFail(int $ruleId): AlertRule
    {
        return AlertRule::findOrFail($ruleId);
    }

    public function create(array $attributes): AlertRule
    {
        return AlertRule::create($attributes);
    }

    public function update(AlertRule $rule, array $attributes): AlertRule
    {
        $rule->update($attributes);

        return $rule->refresh();
    }

    public function delete(AlertRule $rule): void
    {
        $rule->delete();
    }

    /**
     * @return Generator<AlertRule>
     */
    public function cursorActive(): Generator
    {
        yield from AlertRule::query()->where('enabled', true)->cursor();
    }

    public function markEvaluated(array $ruleIds, DateTimeInterface $at): int
    {
        if ($ruleIds === []) {
            return 0;
        }

        return AlertRule::query()->whereIn('id', $ruleIds)->update([
            'last_evaluated_at' => $at,
        ]);
    }

    public function validSlugLookup(): array
    {
        return AlertRule::query()->pluck('slug')->flip()->all();
    }

    public function findBySlug(string $slug): ?AlertRule
    {
        return AlertRule::query()->where('slug', $slug)->first();
    }

    public function findDtoBySlug(string $slug): ?AlertRuleDto
    {
        $rule = $this->findBySlug($slug);

        return $rule !== null ? AlertRuleDto::fromModel($rule) : null;
    }
}
