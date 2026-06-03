<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\DTOs\AlertFilterDto;
use App\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<Alert>
     */
    public function paginate(AlertFilterDto $filter): LengthAwarePaginator;

    public function findOrFail(int $alertId): Alert;

    /**
     * Marks an alert as acknowledged. Accepts alertId only;
     * repository fetches the model internally.
     */
    public function acknowledge(int $alertId, string $userId): Alert;

    /**
     * Marks an alert as resolved. Accepts alertId only;
     * repository fetches the model internally. Validates that
     * the alert is not already resolved.
     *
     * @throws \DomainException If alert is already resolved.
     */
    public function resolve(int $alertId, string $userId): Alert;

    /**
     * Idempotent ingest by AMQP message id. Returns the persisted (or
     * existing) row.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function upsertByMessageId(string $messageId, array $attributes): Alert;
}
