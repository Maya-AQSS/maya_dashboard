<?php

declare(strict_types=1);

namespace App\Services\Booking;

use App\DTOs\BookingDto;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Services\Contracts\BookingServiceInterface;

final class BookingService implements BookingServiceInterface
{
    public function __construct(
        private readonly BookingRepositoryInterface $bookings,
    ) {}

    /**
     * @return list<BookingDto>
     */
    public function listForUserInRange(string $userId, string $fromYmd, string $toYmd): array
    {
        return $this->bookings->findForUserInRange($userId, $fromYmd, $toYmd);
    }
}
