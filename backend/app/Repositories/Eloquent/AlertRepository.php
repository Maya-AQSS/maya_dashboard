<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Alert;
use App\Repositories\Contracts\AlertRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class AlertRepository implements AlertRepositoryInterface
{
    public function paginate(bool $activeOnly, ?string $severity, int $perPage): LengthAwarePaginator
    {
        $query = Alert::query()->with('rule')->orderByDesc('created_at');

        if ($activeOnly) {
            $query->active();
        }

        if ($severity !== null && $severity !== '') {
            $query->where('severity', $severity);
        }

        return $query->paginate($perPage);
    }

    public function findOrFail(int $alertId): Alert
    {
        return Alert::findOrFail($alertId);
    }

    public function acknowledge(Alert $alert, string $userId): Alert
    {
        if ($alert->acknowledged_at === null) {
            $alert->update([
                'acknowledged_at' => now(),
                'acknowledged_by' => $userId,
            ]);
        }

        return $alert->refresh();
    }

    public function resolve(Alert $alert, string $userId): Alert
    {
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
