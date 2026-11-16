<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Attendance\CreateAttendanceRequest;
use App\Http\Requests\Api\Attendance\ListAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\Attendance\AttendanceWriteException;
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

    /**
     * Registra la entrada en Odoo (D21). 201 con el tramo abierto; 409 si ya hay una entrada abierta
     * hoy; 422 si el usuario no es empleado en Odoo; 503 si Odoo no está disponible.
     */
    public function store(CreateAttendanceRequest $request, string $user): JsonResponse
    {
        $source = $request->validated('source');

        try {
            $dto = $this->attendances->clockIn($user, is_string($source) ? $source : null);
        } catch (AttendanceWriteException $e) {
            return $this->writeFailed($e);
        }

        return response()->json(
            (new AttendanceResource($dto))->resolve($request),
            201,
        );
    }

    /**
     * Registra la salida en Odoo (D21). 200 con el tramo cerrado; 409 si hoy no hay ninguna entrada
     * abierta; 422 si el usuario no es empleado en Odoo; 503 si Odoo no está disponible.
     */
    public function checkOut(Request $request, string $user): JsonResponse
    {
        try {
            $dto = $this->attendances->clockOut($user);
        } catch (AttendanceWriteException $e) {
            return $this->writeFailed($e);
        }

        return response()->json(
            (new AttendanceResource($dto))->resolve($request),
        );
    }

    private function writeFailed(AttendanceWriteException $e): JsonResponse
    {
        return response()->json([
            'message' => __('attendance.'.$e->reason),
            'code' => $e->reason,
        ], $e->httpStatus());
    }
}
