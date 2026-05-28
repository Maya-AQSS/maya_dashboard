<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DTOs\AlertRuleDto;
use App\DTOs\AlertRuleFilterDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Contracts\AlertRuleServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class AlertRuleService implements AlertRuleServiceInterface
{
    public function __construct(
        private readonly AlertRuleRepositoryInterface $rules,
    ) {}

    /**
     * @return PaginatedDto<AlertRuleDto>
     */
    public function paginate(AlertRuleFilterDto $filter): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->rules->paginate($filter),
            fn (AlertRule $r): AlertRuleDto => AlertRuleDto::fromModel($r),
        );
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
