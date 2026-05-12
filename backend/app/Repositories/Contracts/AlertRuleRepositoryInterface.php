<?php

namespace App\Repositories\Contracts;

use App\Models\AlertRule;
use Illuminate\Database\Eloquent\Collection;

interface AlertRuleRepositoryInterface
{
    /**
     * @return Collection<int, AlertRule>
     */
    public function listOrderedBySlug(): Collection;

    public function findOrFail(int $ruleId): AlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): AlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(AlertRule $rule, array $attributes): AlertRule;

    public function delete(AlertRule $rule): void;
}
