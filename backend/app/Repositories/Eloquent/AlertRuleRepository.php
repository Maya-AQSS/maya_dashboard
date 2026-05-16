<?php

namespace App\Repositories\Eloquent;

use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use DateTimeInterface;
use Generator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

final class AlertRuleRepository implements AlertRuleRepositoryInterface
{
    public function listOrderedBySlug(): Collection
    {
        return AlertRule::query()->orderBy('slug')->get();
    }

    public function paginateOrderedBySlug(int $perPage = 100): LengthAwarePaginator
    {
        return AlertRule::query()->orderBy('slug')->paginate($perPage);
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
}
