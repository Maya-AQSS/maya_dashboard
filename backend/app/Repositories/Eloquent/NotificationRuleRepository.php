<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\NotificationRule;
use App\Repositories\Contracts\NotificationRuleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class NotificationRuleRepository implements NotificationRuleRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<NotificationRule>
     */
    public function paginate(int $perPage, ?string $sourceApp, ?string $evaluatorKey): LengthAwarePaginator
    {
        return NotificationRule::query()
            ->when($sourceApp !== null && $sourceApp !== '', fn ($q) => $q->where('source_app', $sourceApp))
            ->when($evaluatorKey !== null && $evaluatorKey !== '', fn ($q) => $q->where('evaluator_key', $evaluatorKey))
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findOrFail(int $id): NotificationRule
    {
        return NotificationRule::query()->findOrFail($id);
    }

    public function create(array $attributes): NotificationRule
    {
        return NotificationRule::create($attributes);
    }

    public function update(NotificationRule $rule, array $attributes): NotificationRule
    {
        $rule->update($attributes);

        return $rule->refresh();
    }

    public function delete(NotificationRule $rule): void
    {
        $rule->delete();
    }
}
