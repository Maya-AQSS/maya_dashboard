<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AlertAudienceDto;

interface AlertAudienceServiceInterface
{
    /**
     * Valida pertenencia del creador y devuelve atributos listos para persistir
     * (contenido de la alerta/regla + columnas de audiencia).
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public function attributesForPersist(string $creatorId, array $validated): array;

    /**
     * Actualización: fusiona audiencia actual con el payload y valida solo si
     * el request incluye campos de targeting.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public function attributesForUpdate(string $creatorId, array $validated, AlertAudienceDto $current): array;

    /**
     * @param  array<string, mixed>  $data
     */
    public function containsAudienceInput(array $data): bool;
}
