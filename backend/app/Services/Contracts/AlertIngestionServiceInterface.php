<?php

declare(strict_types=1);

namespace App\Services\Contracts;

interface AlertIngestionServiceInterface
{
    /**
     * Persist an incoming alert payload received from the maya.alerts exchange.
     *
     * @param  array<string, mixed>  $payload
     */
    public function ingest(array $payload, string $messageId): void;
}
