<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Me;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Me\UpdateMeEmployeeRequest;
use App\Repositories\Readers\EmployeeProfileReader;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

// ODOO_BRIDGE — Controlador temporal que almacena sobreescrituras del perfil de
// empleado en una tabla local hasta que Odoo proporcione un API de escritura.
// Eliminar junto con UpdateMeEmployeeRequest, la migración employee_profile_overrides
// y la lógica de merge en EmployeeProfileReader cuando la integración esté completa.
final class MeEmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeProfileReader $reader,
    ) {}

    public function update(UpdateMeEmployeeRequest $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $data   = $request->validated();

        // ODOO_BRIDGE — Upsert en tabla local de overrides.
        DB::table('employee_profile_overrides')->upsert(
            array_merge(['user_id' => $userId, 'updated_at' => now(), 'created_at' => now()], $data),
            ['user_id'],
            ['personal_email', 'iban', 'car_registration_number_1', 'car_registration_number_2', 'car_registration_number_3', 'updated_at'],
        );

        // Invalida el cache para que el próximo /me devuelva los datos actualizados.
        $this->reader->invalidate($userId);

        return response()->json(['data' => $data]);
    }
}
