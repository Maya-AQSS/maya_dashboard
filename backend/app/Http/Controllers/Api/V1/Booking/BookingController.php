<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Booking\ListBookingsRequest;
use App\Http\Resources\BookingResource;
use App\Services\Contracts\BookingServiceInterface;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingServiceInterface $bookings,
    ) {}

    public function index(ListBookingsRequest $request, string $user): JsonResponse
    {
        $from = (string) $request->validated('from');
        $to = (string) $request->validated('to');

        $items = $this->bookings->listForUserInRange($user, $from, $to);

        return response()->json([
            'data' => BookingResource::collection(collect($items))->resolve($request),
            'meta' => [
                'from' => $from,
                'to' => $to,
                'view' => $request->validated('view') ?? 'month',
                'count' => count($items),
            ],
        ]);
    }
}
