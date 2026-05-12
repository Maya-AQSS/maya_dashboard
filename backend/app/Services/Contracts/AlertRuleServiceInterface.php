<?php

namespace App\Services\Contracts;

use App\Models\AlertRule;
use Illuminate\Database\Eloquent\Collection;

interface AlertRuleServiceInterface
{
    /**
     * @return Collection<int, AlertRule>
     */
    public function list(): Collection;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): AlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(int $ruleId, array $attributes): AlertRule;

    public function delete(int $ruleId): void;
}
