<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\NotificationDefinitionDto;
use Illuminate\Support\Collection;

interface NotificationDefinitionServiceInterface
{
    /**
     * @return Collection<int, NotificationDefinitionDto>
     */
    public function list(?string $category = null, ?string $sourceApp = null): Collection;

    public function setEnabled(int $id, bool $enabled): NotificationDefinitionDto;

    public function findByKey(string $key): ?NotificationDefinitionDto;

    /**
     * Whether a notification type should be delivered. Unknown keys (no
     * definition row) default to enabled.
     */
    public function isKeyEnabled(string $key): bool;
}
