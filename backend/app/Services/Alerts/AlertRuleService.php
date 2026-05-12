<?php

namespace App\Services\Alerts;

use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Contracts\AlertRuleServiceInterface;
use Illuminate\Database\Eloquent\Collection;

final class AlertRuleService implements AlertRuleServiceInterface
{
    public function __construct(
        private readonly AlertRuleRepositoryInterface $rules,
    ) {}

    public function list(): Collection
    {
        return $this->rules->listOrderedBySlug();
    }

    public function create(array $attributes): AlertRule
    {
        return $this->rules->create($attributes);
    }

    public function update(int $ruleId, array $attributes): AlertRule
    {
        return $this->rules->update(
            $this->rules->findOrFail($ruleId),
            $attributes,
        );
    }

    public function delete(int $ruleId): void
    {
        $this->rules->delete($this->rules->findOrFail($ruleId));
    }
}
