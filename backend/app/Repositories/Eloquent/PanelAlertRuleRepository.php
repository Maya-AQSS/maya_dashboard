<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\PanelAlertRule;
use App\Repositories\Contracts\PanelAlertRuleRepositoryInterface;
use Generator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class PanelAlertRuleRepository implements PanelAlertRuleRepositoryInterface
{
    public function paginate(int $perPage): LengthAwarePaginator
    {
        return PanelAlertRule::query()->orderBy('name')->paginate($perPage);
    }

    public function findOrFail(int $id): PanelAlertRule
    {
        return PanelAlertRule::findOrFail($id);
    }

    public function create(array $attributes): PanelAlertRule
    {
        return PanelAlertRule::create($attributes);
    }

    public function update(PanelAlertRule $rule, array $attributes): PanelAlertRule
    {
        $rule->update($attributes);

        return $rule->refresh();
    }

    public function delete(PanelAlertRule $rule): void
    {
        $rule->delete();
    }

    /**
     * @return Generator<PanelAlertRule>
     */
    public function cursorActive(): Generator
    {
        yield from PanelAlertRule::query()->where('is_active', true)->cursor();
    }
}
