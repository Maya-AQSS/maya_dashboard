<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\DTOs\AlertFilterDto;
use App\Models\Alert;
use App\Repositories\Contracts\AlertRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class AlertRepository implements AlertRepositoryInterface
{
    public function paginate(AlertFilterDto $filter): LengthAwarePaginator
    {
        $query = Alert::query()->with('rule')->orderByDesc('created_at');

        if ($filter->activeOnly) {
            $query->active();
        }

        if ($filter->severity !== null && $filter->severity !== '') {
            $query->where('severity', $filter->severity);
        }

        return $query->paginate($filter->perPage, page: $filter->page);
    }

    public function findOrFail(int $alertId): Alert
    {
        return Alert::findOrFail($alertId);
    }

    public function acknowledge(int $alertId, string $userId): Alert
    {
        $alert = $this->findOrFail($alertId);

        if ($alert->acknowledged_at === null) {
            $alert->update([
                'acknowledged_at' => now(),
                'acknowledged_by' => $userId,
            ]);
        }

        return $alert->refresh();
    }

    public function resolve(int $alertId, string $userId): Alert
    {
        $alert = $this->findOrFail($alertId);

        if ($alert->resolved_at !== null) {
            throw new \DomainException('Alert already resolved');
        }

        $alert->update([
            'resolved_at' => now(),
            'resolved_by' => $userId,
            'acknowledged_at' => $alert->acknowledged_at ?? now(),
            'acknowledged_by' => $alert->acknowledged_by ?? $userId,
        ]);

        return $alert->refresh();
    }

    public function upsertByMessageId(string $messageId, array $attributes): Alert
    {
        return Alert::updateOrCreate(['message_id' => $messageId], $attributes);
    }
}
