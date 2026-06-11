<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\DTOs\AlertAudienceDto;
use App\DTOs\NotificationRuleDto;
use App\Models\NotificationRule;
use App\Repositories\Contracts\NotificationRuleRepositoryInterface;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\NotificationDefinitionServiceInterface;
use App\Services\Contracts\NotificationRuleServiceInterface;
use Illuminate\Validation\ValidationException;
use Maya\Http\Pagination\PaginatedDto;

final class NotificationRuleService implements NotificationRuleServiceInterface
{
    public function __construct(
        private readonly NotificationRuleRepositoryInterface $rules,
        private readonly AlertAudienceServiceInterface $audience,
        private readonly NotificationDefinitionServiceInterface $definitions,
    ) {}

    /**
     * @return PaginatedDto<NotificationRuleDto>
     */
    public function paginate(int $perPage, ?string $sourceApp, ?string $evaluatorKey): PaginatedDto
    {
        return PaginatedDto::fromPaginator(
            $this->rules->paginate($perPage, $sourceApp, $evaluatorKey),
            fn (NotificationRule $r): NotificationRuleDto => NotificationRuleDto::fromModel($r),
        );
    }

    /**
     * @return PaginatedDto<NotificationRuleDto>
     */
    public function paginateWithFilters(int $page, int $perPage, ?string $sourceApp = null, ?string $evaluatorKey = null, ?string $search = null, string $sortBy = 'name', string $sortDir = 'asc'): PaginatedDto
    {
        $paginated = $this->rules->paginateWithFilters($page, $perPage, $sourceApp, $evaluatorKey, $search, $sortBy, $sortDir);

        return $paginated->mapItems(fn (NotificationRule $r): NotificationRuleDto => NotificationRuleDto::fromModel($r));
    }

    public function find(int $id): NotificationRuleDto
    {
        return NotificationRuleDto::fromModel($this->rules->findOrFail($id));
    }

    public function create(array $data, string $createdBy): NotificationRuleDto
    {
        $definition = $this->resolveScheduledDefinition((string) ($data['evaluator_key'] ?? ''));

        $attributes = $this->audience->attributesForPersist($createdBy, $data);
        // source_app is authoritative from the definition (the owning service).
        $attributes['source_app'] = $definition->sourceApp;

        return NotificationRuleDto::fromModel(
            $this->rules->create(array_merge($attributes, ['created_by' => $createdBy])),
        );
    }

    public function update(int $id, array $data, string $updatedBy): NotificationRuleDto
    {
        $rule = $this->rules->findOrFail($id);

        if (isset($data['evaluator_key'])) {
            $definition = $this->resolveScheduledDefinition((string) $data['evaluator_key']);
            $data['source_app'] = $definition->sourceApp;
        }

        $attributes = $this->audience->attributesForUpdate(
            $updatedBy,
            $data,
            AlertAudienceDto::fromModel($rule),
        );

        return NotificationRuleDto::fromModel($this->rules->update($rule, $attributes));
    }

    public function delete(int $id): void
    {
        $this->rules->delete($this->rules->findOrFail($id));
    }

    /**
     * The evaluator_key must reference an existing scheduled definition.
     */
    private function resolveScheduledDefinition(string $evaluatorKey): \App\DTOs\NotificationDefinitionDto
    {
        $definition = $this->definitions->findByKey($evaluatorKey);

        if ($definition === null || $definition->category !== 'scheduled') {
            throw ValidationException::withMessages([
                'evaluator_key' => 'evaluator_key must reference an existing scheduled notification definition.',
            ]);
        }

        return $definition;
    }
}
