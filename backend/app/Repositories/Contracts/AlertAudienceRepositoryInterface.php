<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\DTOs\AlertAudienceDto;
use Generator;

interface AlertAudienceRepositoryInterface
{
    /**
     * IDs Keycloak de usuarios activos que pertenecen a la audiencia.
     *
     * @return Generator<string>
     */
    public function cursorRecipientIdsForAudience(AlertAudienceDto $audience): Generator;

    public function userMatchesAudience(string $userId, AlertAudienceDto $audience): bool;
}
