<?php

namespace App\Services;

use App\DTOs\UserContextDto;
use App\Models\User;
use App\Repositories\OdooUserContextRepository;
use Illuminate\Database\QueryException;

class UserContextService
{
    public function __construct(
        private readonly OdooUserContextRepository $repository,
    ) {
    }

    /**
     * Construye el contexto del usuario a partir de los datos del usuario y los datos del perfil del usuario.
     *
     * @param User $user
     * @return UserContextDto
     */
    public function build(User $user): UserContextDto
    {
        $fallback = new UserContextDto(
            keycloakId: (string) $user->keycloak_id,
            odooUserId: null,
            email: (string) $user->email,
            name: (string) $user->name,
            teams: [],
            studyTypes: [],
            studies: [],
            modules: [],
            source: 'jwt_fallback',
        );

        if (! (bool) config('database.fdw.odoo.enabled', false)) {
            return $fallback;
        }

        // Estrategia de resolución:
        // 1) Priorizar mapeo directo por employee_id cuando keycloak_id es numérico.
        // 2) Usar fallback por email (res_users.login) cuando no exista mapeo directo.
        try {
            $profile = null;

            // Si keycloak_id representa employee_id de Odoo, priorizamos esa resolución.
            if (is_string($user->keycloak_id) && ctype_digit($user->keycloak_id)) {
                $profile = $this->repository->findProfileByEmployeeId((int) $user->keycloak_id);
            }

            // Si no encontramos por employee_id, intentamos por email.
            if ($profile === null) {
                $profile = $this->repository->findProfileByEmail((string) $user->email);
            }
        } catch (QueryException) {
            return $fallback;
        }

        if ($profile === null || ! isset($profile['odoo_user_id'])) {
            return $fallback;
        }

        $odooUserId = (int) $profile['odoo_user_id'];

        try {
            return new UserContextDto(
                keycloakId: (string) $user->keycloak_id,
                odooUserId: $odooUserId,
                email: (string) ($profile['email'] ?? $user->email),
                name: (string) ($profile['full_name'] ?? $user->name),
                teams: $this->repository->getTeamsByOdooUserId($odooUserId),
                studyTypes: $this->repository->getStudyTypesByOdooUserId($odooUserId),
                studies: $this->repository->getStudiesByOdooUserId($odooUserId),
                modules: $this->repository->getModulesByOdooUserId($odooUserId),
                source: 'odoo_fdw',
            );
        } catch (QueryException) {
            return $fallback;
        }
    }
}
