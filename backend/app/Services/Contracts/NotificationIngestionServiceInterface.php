<?php

declare(strict_types=1);

namespace App\Services\Contracts;

interface NotificationIngestionServiceInterface
{
    /**
     * Persist an incoming notification payload received from RabbitMQ.
     * Returns true on success, false if the payload was skipped (e.g. the
     * recipient does not exist in the federated users table).
     *
     * @param  array<string, mixed>  $payload
     */
    public function ingest(array $payload, string $messageId): bool;
}
