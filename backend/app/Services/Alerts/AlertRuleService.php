<?php

namespace App\Services\Alerts;

use App\DTOs\AlertRuleDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Contracts\AlertRuleServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class AlertRuleService implements AlertRuleServiceInterface
{
    public function __construct(
        private readonly AlertRuleRepositoryInterface $rules,
    ) {}

    /**
     * @return LengthAwarePaginator<AlertRuleDto>
     */
    public function list(int $perPage = 100): LengthAwarePaginator
    {
        $paginator = $this->rules->paginateOrderedBySlug($perPage);

        $paginator->getCollection()->transform(
            fn (AlertRule $r): AlertRuleDto => AlertRuleDto::fromModel($r),
        );

        return $paginator;
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
