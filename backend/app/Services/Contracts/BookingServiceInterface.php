<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\BookingDto;

interface BookingServiceInterface
{
    /**
     * @return list<BookingDto>
     */
    public function listForUserInRange(string $userId, string $fromYmd, string $toYmd): array;
}
