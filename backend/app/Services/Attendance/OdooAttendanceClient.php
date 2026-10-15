<?php

declare(strict_types=1);

namespace App\Services\Attendance;

use App\DTOs\AttendanceDto;
use App\Services\Contracts\AttendanceWriterInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Registra los fichajes en Odoo con `POST /api/v1/attendance/clock` de maya_attendance (D21).
 *
 * - Autenticación: `Authorization: Bearer <ODOO_ATTENDANCE_API_KEY>`, la clave de API del usuario
 *   técnico de fichajes de Odoo (solo puede crear fichajes; la clave está en Vault).
 * - El empleado se identifica por el `sub` del token de Keycloak, que en Odoo es `res_users.oauth_uid`
 *   (D26, R4). La hora la pone Odoo.
 * - Sin reintentos: Odoo no duplica (409 si ya hay una entrada abierta o no hay ninguna que cerrar).
 */
final class OdooAttendanceClient implements AttendanceWriterInterface
{
    private const PATH = '/api/v1/attendance/clock';

    public function __construct(
        private readonly ?string $baseUrl,
        #[\SensitiveParameter]
        private readonly ?string $apiKey,
        private readonly float $timeout = 5.0,
    ) {}

    public function clockIn(string $userId, string $terminalId): AttendanceDto
    {
        $attendance = $this->section($this->post($userId, 'I', $terminalId), 'attendance');

        return AttendanceDto::fromRow([
            'id' => $attendance['id'],
            'user_id' => $userId,
            'check_in' => $attendance['check_time'],
            'check_out' => null,
            'source' => $attendance['terminal_id'] ?? $terminalId,
        ]);
    }

    public function clockOut(string $userId, string $terminalId): AttendanceDto
    {
        $body = $this->post($userId, 'O', $terminalId);
        $attendance = $this->section($body, 'attendance');
        $checkIn = $this->section($body, 'check_in');

        // El tramo es el de la entrada que se cierra (mismo id que en la lectura por FDW).
        return AttendanceDto::fromRow([
            'id' => $checkIn['id'],
            'user_id' => $userId,
            'check_in' => $checkIn['check_time'],
            'check_out' => $attendance['check_time'],
            'source' => $checkIn['terminal_id'] ?? null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function post(string $userId, string $type, string $terminalId): array
    {
        if (blank($this->baseUrl) || blank($this->apiKey)) {
            Log::warning('Fichajes: falta ODOO_URL u ODOO_ATTENDANCE_API_KEY');

            throw AttendanceWriteException::unavailable('faltan ODOO_URL u ODOO_ATTENDANCE_API_KEY');
        }

        try {
            $response = Http::baseUrl(rtrim((string) $this->baseUrl, '/'))
                ->withToken((string) $this->apiKey)
                ->acceptJson()
                ->asJson()
                ->connectTimeout($this->timeout)
                ->timeout($this->timeout)
                ->post(self::PATH, [
                    'oauth_uid' => $userId,
                    'type' => $type,
                    'terminal_id' => $terminalId,
                ]);
        } catch (ConnectionException $e) {
            Log::warning('Fichajes: Odoo no responde', ['error' => $e->getMessage()]);

            throw AttendanceWriteException::unavailable('sin conexión', $e);
        }

        if ($response->status() === 201) {
            $body = $response->json();
            if (is_array($body)) {
                return $body;
            }

            throw $this->rejected($response, 'respuesta 201 sin JSON');
        }

        $code = $response->json('code');

        throw match (true) {
            $response->status() === 409 && $code === 'ALREADY_CHECKED_IN' => AttendanceWriteException::alreadyCheckedIn(),
            $response->status() === 409 && $code === 'NO_OPEN_CHECK_IN' => AttendanceWriteException::noOpenCheckIn(),
            $response->status() === 404 && $code === 'EMPLOYEE_NOT_FOUND' => AttendanceWriteException::employeeNotFound(),
            default => $this->rejected($response, 'respuesta inesperada'),
        };
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{id: int|string, check_time: string, terminal_id?: string|null}
     */
    private function section(array $body, string $key): array
    {
        $section = $body[$key] ?? null;
        if (! is_array($section)
            || ! (is_int($section['id'] ?? null) || is_string($section['id'] ?? null))
            || ! is_string($section['check_time'] ?? null)) {
            Log::warning('Fichajes: respuesta de Odoo sin «'.$key.'» válido');

            throw AttendanceWriteException::unavailable("respuesta sin «{$key}» válido");
        }

        return $section;
    }

    private function rejected(Response $response, string $detail): AttendanceWriteException
    {
        // Sin el cuerpo completo ni cabeceras: solo estado y código de error de Odoo.
        $code = $response->json('code');
        Log::warning('Fichajes: Odoo rechazó la petición', [
            'status' => $response->status(),
            'code' => is_string($code) ? $code : null,
        ]);

        return AttendanceWriteException::unavailable("{$detail} ({$response->status()})");
    }
}
