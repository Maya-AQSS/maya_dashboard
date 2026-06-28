<?php

declare(strict_types=1);

namespace App\Repositories\Resolvers;

use App\Repositories\Readers\EmployeeProfileReader;
use Maya\Profile\Dtos\UserProfileDto;
use Maya\Profile\Repositories\Contracts\UserProfileResolverInterface;
use Maya\Profile\Repositories\Resolvers\FdwAcademicResolver;

/**
 * Resolver específico del dashboard.
 *
 * Extiende `FdwAcademicResolver` (permissions + academic IDs split en
 * department_ids / team_ids) con los campos del empleado desde la FDW local
 * `employee_profiles` → `v_app_employee_profile` en Odoo.
 *
 * Shape de `/me` resultante:
 *   id, email, name, locale          — UserProfileDto base
 *   permissions                      — FdwEnrichedJwtResolver
 *   study_type_ids, study_ids, module_ids  — AcademicDataReader
 *   department_ids, team_ids         — AcademicDataReader (split por is_department)
 *   employee                         — EmployeeProfileReader
 *     personal_email, position_type, supervisor_name, mentor_name,
 *     keys, date_keys_handover, date_keys_return,
 *     iban, id_card_rfid,
 *     car_registration_number_1/2/3
 */
final class DashboardProfileResolver implements UserProfileResolverInterface
{
    public function __construct(
        private readonly FdwAcademicResolver $base = new FdwAcademicResolver,
        private readonly EmployeeProfileReader $employee = new EmployeeProfileReader,
    ) {}

    public function resolve(string $userId, array $jwtProfile): UserProfileDto
    {
        $dto = $this->base->resolve($userId, $jwtProfile);

        $employeeData = $this->employee->read($dto->id);

        return new UserProfileDto(
            id: $dto->id,
            email: $dto->email,
            name: $dto->name,
            locale: $dto->locale,
            extra: array_merge($dto->extra, ['employee' => $employeeData]),
        );
    }

    public function invalidate(string $userId): void
    {
        $this->base->invalidate($userId);
        $this->employee->invalidate($userId);
    }
}
