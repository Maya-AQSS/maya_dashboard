<?php

declare(strict_types=1);

namespace App\Services\PanelAlerts;

use App\DTOs\AlertAudienceDto;
use App\DTOs\PanelAlertRuleDto;
use App\Models\PanelAlertRule;
use App\Repositories\Contracts\PanelAlertRuleRepositoryInterface;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\PanelAlertRuleServiceInterface;
use Maya\Http\Pagination\PaginatedDto;

final class PanelAlertRuleService implements PanelAlertRuleServiceInterface
{
    public function __construct(
        private readonly PanelAlertRuleRepositoryInterface $rules,
        private readonly AlertAudienceServiceInterface $audience,
    ) {}

    /**
     * @return PaginatedDto<PanelAlertRuleDto>
     */
    public function paginate(int $perPage): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->rules->paginate($perPage),
            fn (PanelAlertRule $rule): PanelAlertRuleDto => PanelAlertRuleDto::fromModel($rule),
        );
    }

    public function find(int $id): PanelAlertRuleDto
    {
        return PanelAlertRuleDto::fromModel($this->rules->findOrFail($id));
    }

    public function create(array $data, string $createdBy): PanelAlertRuleDto
    {
        $attributes = $this->audience->attributesForPersist($createdBy, $data);

        return PanelAlertRuleDto::fromModel(
            $this->rules->create(array_merge($attributes, ['created_by' => $createdBy])),
        );
    }

    public function update(int $id, array $data, string $updatedBy): PanelAlertRuleDto
    {
        $rule = $this->rules->findOrFail($id);
        $attributes = $this->audience->attributesForUpdate(
            $updatedBy,
            $data,
            AlertAudienceDto::fromModel($rule),
        );

        return PanelAlertRuleDto::fromModel(
            $this->rules->update($rule, $attributes),
        );
    }

    public function delete(int $id): void
    {
        $this->rules->delete($this->rules->findOrFail($id));
    }
}
