<?php

namespace App\Services\Alerts;

use App\DataTransferObjects\AlertRuleDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Contracts\AlertRuleServiceInterface;

final class AlertRuleService implements AlertRuleServiceInterface
{
    public function __construct(
        private readonly AlertRuleRepositoryInterface $rules,
    ) {}

    /**
     * @return list<AlertRuleDto>
     */
    public function list(): array
    {
        return $this->rules->listOrderedBySlug()
            ->map(fn (AlertRule $r): AlertRuleDto => AlertRuleDto::fromModel($r))
            ->values()
            ->all();
    }

    public function create(array $attributes): AlertRuleDto
    {
        return AlertRuleDto::fromModel($this->rules->create($attributes));
    }

    public function update(int $ruleId, array $attributes): AlertRuleDto
    {
        return AlertRuleDto::fromModel($this->rules->update(
            $this->rules->findOrFail($ruleId),
            $attributes,
        ));
    }

    public function delete(int $ruleId): void
    {
        $this->rules->delete($this->rules->findOrFail($ruleId));
    }
}
