<?php

use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\Http;

// Registro de fichajes (D21): el dashboard llama a POST /api/v1/attendance/clock de maya_attendance
// con la clave del usuario técnico y el `sub` del token; nunca escribe por FDW. Sin base de datos:
// Odoo se simula con Http::fake.

beforeEach(function () {
    config([
        'services.odoo.url' => 'http://odoo.test:8069/',
        'services.odoo.attendance_api_key' => 'clave-de-prueba',
        'services.odoo.attendance_terminal_id' => 'dashboard',
    ]);
    Http::preventStrayRequests();

    $this->withoutMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);
    $this->userId = '0b4f6c1e-7d0a-4a52-9a43-3f2f0c1d2e01';

    $userId = $this->userId;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', ['id' => $userId, 'sub' => $userId]);
    });
});

function odooClockIn(int $id = 41, string $checkTime = '2026-10-15T07:30:00Z', string $terminal = 'dashboard'): array
{
    return [
        'success' => true,
        'attendance' => [
            'id' => $id,
            'employee_id' => 7,
            'type' => 'I',
            'check_time' => $checkTime,
            'check_date' => substr($checkTime, 0, 10),
            'terminal_id' => $terminal,
            'location_id' => 1,
        ],
    ];
}

function odooError(string $code): array
{
    return ['success' => false, 'code' => $code, 'error' => 'mensaje de Odoo'];
}

function sentToOdoo(HttpRequest $request, string $userId, string $type, string $terminal): bool
{
    return $request->url() === 'http://odoo.test:8069/api/v1/attendance/clock'
        && $request->method() === 'POST'
        && $request->hasHeader('Authorization', 'Bearer clave-de-prueba')
        && $request->data() === ['oauth_uid' => $userId, 'type' => $type, 'terminal_id' => $terminal];
}

// ── Entrada ──────────────────────────────────────────────────────────────

it('clocks in through the Odoo endpoint with the sub of the token', function () {
    Http::fake(['*' => Http::response(odooClockIn(), 201)]);

    $response = $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", []);

    $response->assertStatus(201)->assertExactJson([
        'id' => '41',
        'user_id' => $this->userId,
        'check_in' => '2026-10-15T07:30:00+00:00',
        'check_out' => null,
        'source' => 'dashboard',
    ]);
    Http::assertSentCount(1);
    Http::assertSent(fn (HttpRequest $request) => sentToOdoo($request, $this->userId, 'I', 'dashboard'));
});

it('sends the source as terminal_id', function () {
    Http::fake(['*' => Http::response(odooClockIn(terminal: 'mobile'), 201)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", ['source' => 'mobile'])
        ->assertStatus(201)
        ->assertJsonFragment(['source' => 'mobile']);

    Http::assertSent(fn (HttpRequest $request) => sentToOdoo($request, $this->userId, 'I', 'mobile'));
});

it('rejects a source longer than 64 chars without calling Odoo', function () {
    Http::fake();

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", ['source' => str_repeat('a', 65)])
        ->assertStatus(422);

    Http::assertNothingSent();
});

it('returns 409 when Odoo already has an open check-in today', function () {
    Http::fake(['*' => Http::response(odooError('ALREADY_CHECKED_IN'), 409)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", [])
        ->assertStatus(409)
        ->assertJson(['code' => 'already_checked_in', 'message' => __('attendance.already_checked_in')]);
});

it('returns 422 when the user is not an employee in Odoo', function () {
    Http::fake(['*' => Http::response(odooError('EMPLOYEE_NOT_FOUND'), 404)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", [])
        ->assertStatus(422)
        ->assertJson(['code' => 'employee_not_found']);
});

it('returns 503 when Odoo rejects the service key', function () {
    Http::fake(['*' => Http::response(odooError('INVALID_API_KEY'), 401)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", [])
        ->assertStatus(503)
        ->assertJson(['code' => 'unavailable']);
});

it('returns 503 when Odoo does not answer', function () {
    Http::fake(['*' => Http::failedConnection()]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", [])
        ->assertStatus(503)
        ->assertJson(['code' => 'unavailable']);
});

it('returns 503 when Odoo answers 201 without the attendance', function () {
    Http::fake(['*' => Http::response(['success' => true], 201)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", [])
        ->assertStatus(503)
        ->assertJson(['code' => 'unavailable']);
});

it('returns 503 without calling Odoo when it is not configured', function () {
    config(['services.odoo.attendance_api_key' => null]);
    Http::fake();

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances", [])
        ->assertStatus(503)
        ->assertJson(['code' => 'unavailable']);

    Http::assertNothingSent();
});

it('does not clock in for another user', function () {
    Http::fake();

    $this->postJson('/api/v1/dashboard/user/otro-usuario/attendances', [])
        ->assertForbidden();

    Http::assertNothingSent();
});

// ── Salida ───────────────────────────────────────────────────────────────

it('clocks out and returns the closed span', function () {
    Http::fake(['*' => Http::response([
        'success' => true,
        'attendance' => [
            'id' => 52,
            'employee_id' => 7,
            'type' => 'O',
            'check_time' => '2026-10-15T11:00:00Z',
            'check_date' => '2026-10-15',
            'terminal_id' => 'dashboard',
            'location_id' => 1,
        ],
        'check_in' => ['id' => 41, 'type' => 'I', 'check_time' => '2026-10-15T07:30:00Z', 'terminal_id' => 'TERM01'],
    ], 201)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances/check-out")
        ->assertOk()
        ->assertExactJson([
            'id' => '41',
            'user_id' => $this->userId,
            'check_in' => '2026-10-15T07:30:00+00:00',
            'check_out' => '2026-10-15T11:00:00+00:00',
            'source' => 'TERM01',
        ]);
    Http::assertSent(fn (HttpRequest $request) => sentToOdoo($request, $this->userId, 'O', 'dashboard'));
});

it('returns 409 from check-out when Odoo has no open check-in', function () {
    Http::fake(['*' => Http::response(odooError('NO_OPEN_CHECK_IN'), 409)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances/check-out")
        ->assertStatus(409)
        ->assertJson(['code' => 'no_open_check_in', 'message' => __('attendance.no_open_check_in')]);
});

it('returns 503 from check-out when Odoo omits the closed check-in', function () {
    Http::fake(['*' => Http::response(odooClockIn(), 201)]);

    $this->postJson("/api/v1/dashboard/user/{$this->userId}/attendances/check-out")
        ->assertStatus(503)
        ->assertJson(['code' => 'unavailable']);
});
