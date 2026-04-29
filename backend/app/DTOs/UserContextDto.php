<?php

namespace App\DTOs;

final class UserContextDto
{
    /**
     * @param array<int, array<string, mixed>> $teams
     * @param array<int, array<string, mixed>> $studyTypes
     * @param array<int, array<string, mixed>> $studies
     * @param array<int, array<string, mixed>> $modules
     */
    public function __construct(
        public readonly string $keycloakId,
        public readonly ?int $odooUserId,
        public readonly string $email,
        public readonly string $name,
        public readonly array $teams,
        public readonly array $studyTypes,
        public readonly array $studies,
        public readonly array $modules,
        public readonly string $source,
    ) {
    }

    /**
     * Preparar los datos del usuario para ser utilizados en la aplicación.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'keycloak_id' => $this->keycloakId,
            'odoo_user_id' => $this->odooUserId,
            'email' => $this->email,
            'name' => $this->name,
            'teams' => $this->teams,
            'study_types' => $this->studyTypes,
            'studies' => $this->studies,
            'modules' => $this->modules,
            'source' => $this->source,
        ];
    }
}
