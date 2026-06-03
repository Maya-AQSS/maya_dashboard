<?php

declare(strict_types=1);

namespace App\Services\Alerts;

use App\DTOs\AlertAudienceDto;
use App\DTOs\AlertRuleDto;
use App\DTOs\AlertRuleFilterDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\AlertRuleServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class AlertRuleService implements AlertRuleServiceInterface
{
    public function __construct(
        private readonly AlertRuleRepositoryInterface $rules,
        private readonly AlertAudienceServiceInterface $audience,
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

    public function find(int $ruleId): AlertRuleDto
    {
        return AlertRuleDto::fromModel($this->rules->findOrFail($ruleId));
    }

    public function create(array $attributes, string $createdBy): AlertRuleDto
    {
        $payload = $this->audience->attributesForPersist($createdBy, $attributes);

        return AlertRuleDto::fromModel($this->rules->create(array_merge($payload, [
            'created_by_id' => $createdBy,
        ])));
    }

    public function update(int $ruleId, array $attributes, string $updatedBy): AlertRuleDto
    {
        $rule = $this->rules->findOrFail($ruleId);
        $payload = $this->audience->attributesForUpdate(
            $updatedBy,
            $attributes,
            AlertAudienceDto::fromModel($rule),
        );

        return AlertRuleDto::fromModel($this->rules->update($rule, $payload));
    }

    public function delete(int $ruleId): void
    {
        $this->rules->delete($this->rules->findOrFail($ruleId));
    }
}
