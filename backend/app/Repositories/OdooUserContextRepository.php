<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class OdooUserContextRepository
{
    /**
     * Obtiene el perfil del usuario por employee_id.
     *
     * @return array<string, mixed>|null
     */
    public function findProfileByEmployeeId(int $employeeId): ?array
    {
        $row = DB::table('odoo_user_profiles')
            ->where('employee_id', $employeeId)
            ->first();

        return $row ? (array) $row : null;
    }

    /**
     * Obtiene el perfil del usuario desde la tabla odoo_user_profiles.
     *
     * @return array<string, mixed>|null
     */
    public function findProfileByEmail(string $email): ?array
    {
        $row = DB::table('odoo_user_profiles')
            ->whereRaw('LOWER(email) = LOWER(?)', [$email])
            ->first();

        return $row ? (array) $row : null;
    }

    /**
     * Obtiene los equipos del usuario desde la tabla odoo_user_teams.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getTeamsByOdooUserId(int $odooUserId): array
    {
        return DB::table('odoo_user_teams')
            ->where('odoo_user_id', $odooUserId)
            ->orderBy('team_code')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();
    }

    /**
     * Obtiene los tipos de estudio del usuario desde la tabla odoo_user_study_types.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getStudyTypesByOdooUserId(int $odooUserId): array
    {
        return DB::table('odoo_user_study_types')
            ->where('odoo_user_id', $odooUserId)
            ->orderBy('study_type_id')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();
    }

    /**
     * Obtiene los estudios del usuario desde la tabla odoo_user_studies.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getStudiesByOdooUserId(int $odooUserId): array
    {
        return DB::table('odoo_user_studies')
            ->where('odoo_user_id', $odooUserId)
            ->orderBy('study_id')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();
    }

    /**
     * Obtiene los módulos del usuario desde la tabla odoo_user_modules.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getModulesByOdooUserId(int $odooUserId): array
    {
        return DB::table('odoo_user_modules')
            ->where('odoo_user_id', $odooUserId)
            ->orderBy('study_id')
            ->orderBy('module_id')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();
    }
}
