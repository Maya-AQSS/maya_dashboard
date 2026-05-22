<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Attendance\CreateAttendanceRequest;
use App\Http\Requests\Api\Attendance\ListAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\Contracts\AttendanceServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(CreateAttendanceRequest $request, string $user): JsonResponse
    {
        $source = $request->validated('source');

        $dto = $this->attendances->clockIn($user, is_string($source) ? $source : null);

        return response()->json(
            (new AttendanceResource($dto))->resolve($request),
            201,
        );
    }

    /**
     * Cierra el check-in abierto del usuario (UPDATE check_out = now).
     * Devuelve 200 con el DTO actualizado o 409 si no hay fila abierta.
     */
    public function checkOut(Request $request, string $user): JsonResponse
    {
        $dto = $this->attendances->clockOut($user);

        if ($dto === null) {
            return response()->json([
                'message' => 'No hay fichaje abierto que cerrar.',
            ], 409);
        }

        return response()->json(
            (new AttendanceResource($dto))->resolve($request),
        );
    }
}
