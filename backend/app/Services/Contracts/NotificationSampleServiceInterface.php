<?php

declare(strict_types=1);

namespace App\Services\Contracts;

interface NotificationSampleServiceInterface
{
    /**
     * Fire a realistic sample notification of the given type, going through the
     * normal ingestion (gate + definition defaults + i18n + broadcast).
     *
     * @return bool true if persisted/delivered, false if dropped (e.g. disabled)
     */
    public function fireSample(string $key, ?string $recipientId): bool;

    /**
     * Fire one sample for every definition in the catalog.
     *
     * @return array<string, bool> key => delivered
     */
    public function fireAll(?string $recipientId): array;
}
