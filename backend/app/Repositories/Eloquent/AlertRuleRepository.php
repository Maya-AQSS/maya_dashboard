<?php

namespace App\Repositories\Eloquent;

use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

final class AlertRuleRepository implements AlertRuleRepositoryInterface
{
    public function listOrderedBySlug(): Collection
    {
        return AlertRule::query()->orderBy('slug')->get();
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
}
