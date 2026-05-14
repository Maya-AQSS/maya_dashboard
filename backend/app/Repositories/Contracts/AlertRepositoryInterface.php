<?php

namespace App\Repositories\Contracts;

use App\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<Alert>
     */
    public function paginate(bool $activeOnly, ?string $severity, int $perPage): LengthAwarePaginator;

    public function findOrFail(int $alertId): Alert;

    public function acknowledge(Alert $alert, string $userId): Alert;

    public function resolve(Alert $alert, string $userId): Alert;

    /**
     * Idempotent ingest by AMQP message id. Returns the persisted (or
     * existing) row.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function upsertByMessageId(string $messageId, array $attributes): Alert;
}
