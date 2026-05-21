<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\DTOs\BookingDto;

interface BookingRepositoryInterface
{
    /**
     * Devuelve reservas de `userId` que solapen el rango [fromYmd, toYmd]
     * (ambos inclusive), ordenadas ascendentemente por start_at.
     *
     * @return list<BookingDto>
     */
    public function findForUserInRange(string $userId, string $fromYmd, string $toYmd): array;
}
