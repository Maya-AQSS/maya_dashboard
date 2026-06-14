<?php

declare(strict_types=1);

namespace App\Repositories\Readers;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Lee el perfil de empleado del usuario autenticado desde la FDW local
 * `employee_profiles` (proyectada desde `odoo.public.v_app_employee_profile`).
 *
 * Devuelve los campos que el dashboard incluye en `/me` para que el frontend
 * los cachée en sesión junto con permisos y contexto académico.
 *
 * Degradación silenciosa: si la FDW no está disponible (testing sin tabla,
 * conexión rota) devuelve array de nulls — nunca lanza.
 *
 * Cache: TTL 5 min, key `me_employee:{userId}`. Se invalida al actualizarse
 * el perfil via PATCH /me/employee (pendiente de implementar).
 */
final class EmployeeProfileReader
{
    private const CACHE_TTL = 300;

    /**
     * @return array{
     *   personal_email: string|null,
     *   position_type: string|null,
     *   supervisor_name: string|null,
     *   mentor_name: string|null,
     *   keys: string|null,
     *   date_keys_handover: string|null,
     *   date_keys_return: string|null,
     *   iban: string|null,
     *   id_card_rfid: string|null,
     *   car_registration_number_1: string|null,
     *   car_registration_number_2: string|null,
     *   car_registration_number_3: string|null,
     * }
     */
    public function read(string $userId): array
    {
        if ($userId === '') {
            return $this->empty();
        }

        try {
            return Cache::remember(
                $this->cacheKey($userId),
                self::CACHE_TTL,
                fn (): array => $this->fetch($userId),
            );
        } catch (QueryException) {
            return $this->empty();
        } catch (\Throwable) {
            return $this->empty();
        }
    }

    public function invalidate(string $userId): void
    {
        Cache::forget($this->cacheKey($userId));
    }

    /**
     * @return array<string, string|null>
     */
    private function fetch(string $userId): array
    {
        $row = DB::table('employee_profiles')
            ->where('user_id', '=', $userId)
            ->first();

        if ($row === null) {
            return $this->empty();
        }

        return [
            'personal_email' => $this->str($row->personal_email ?? null),
            'position_type' => $this->str($row->position_type ?? null),
            'supervisor_name' => $this->str($row->supervisor_name ?? null),
            'mentor_name' => $this->str($row->mentor_name ?? null),
            'keys' => $this->str($row->keys ?? null),
            'date_keys_handover' => $this->str($row->date_keys_handover ?? null),
            'date_keys_return' => $this->str($row->date_keys_return ?? null),
            'iban' => $this->str($row->iban ?? null),
            'id_card_rfid' => $this->str($row->id_card_rfid ?? null),
            'car_registration_number_1' => $this->str($row->car_registration_number_1 ?? null),
            'car_registration_number_2' => $this->str($row->car_registration_number_2 ?? null),
            'car_registration_number_3' => $this->str($row->car_registration_number_3 ?? null),
        ];
    }

    /**
     * @return array<string, null>
     */
    private function empty(): array
    {
        return [
            'personal_email' => null,
            'position_type' => null,
            'supervisor_name' => null,
            'mentor_name' => null,
            'keys' => null,
            'date_keys_handover' => null,
            'date_keys_return' => null,
            'iban' => null,
            'id_card_rfid' => null,
            'car_registration_number_1' => null,
            'car_registration_number_2' => null,
            'car_registration_number_3' => null,
        ];
    }

    private function cacheKey(string $userId): string
    {
        return "me_employee:{$userId}";
    }

    private function str(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) $value;
    }
}
