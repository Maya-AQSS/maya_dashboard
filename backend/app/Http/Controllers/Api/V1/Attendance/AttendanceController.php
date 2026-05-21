<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Attendance\ListAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\Contracts\AttendanceServiceInterface;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceServiceInterface $attendances,
    ) {}

    public function index(ListAttendanceRequest $request, string $user): JsonResponse
    {
        $date = (string) ($request->validated('date') ?? now()->format('Y-m-d'));

        $items = $this->attendances->listForUserOnDate($user, $date);

        return response()->json([
            'data' => AttendanceResource::collection(collect($items))->resolve($request),
            'meta' => [
                'date' => $date,
                'count' => count($items),
            ],
        ]);
    }
}
