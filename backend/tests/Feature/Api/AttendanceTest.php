<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);
    $this->user = User::factory()->create();

    $userId = $this->user->id;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', [
            'id' => $userId,
            'sub' => $userId,
        ]);
    });
});

function insertAttendance(string $userId, string $checkIn, ?string $checkOut = null, string $source = 'kiosk'): void
{
    DB::table('attendances')->insert([
        'id' => uniqid('att_', true),
        'user_id' => $userId,
        'check_in' => $checkIn,
        'check_out' => $checkOut,
        'source' => $source,
    ]);
}

it('returns empty list when user has no attendances on the given date', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/attendances?date=2026-05-21")
        ->assertOk()
        ->assertJson(['data' => [], 'meta' => ['date' => '2026-05-21', 'count' => 0]]);
});

it('lists attendances for the day ordered by check_in', function () {
    insertAttendance($this->user->id, '2026-05-21 14:00:00', '2026-05-21 18:00:00');
    insertAttendance($this->user->id, '2026-05-21 08:30:00', '2026-05-21 13:30:00');
    insertAttendance($this->user->id, '2026-05-20 09:00:00', '2026-05-20 17:00:00');

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/attendances?date=2026-05-21");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('data.0.check_in'))->toContain('08:30');
    expect($response->json('data.1.check_in'))->toContain('14:00');
    expect($response->json('meta.count'))->toBe(2);
});

it('does not return attendances of other users', function () {
    $other = User::factory()->create();
    insertAttendance($other->id, '2026-05-21 09:00:00', '2026-05-21 17:00:00');

    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/attendances?date=2026-05-21")
        ->assertOk()
        ->assertJson(['data' => []]);
});

it('defaults to today when date is omitted', function () {
    $today = now()->format('Y-m-d');
    insertAttendance($this->user->id, $today.' 09:00:00', $today.' 17:00:00');

    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/attendances")
        ->assertOk()
        ->assertJson(['meta' => ['date' => $today, 'count' => 1]]);
});

it('rejects invalid date format', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/attendances?date=21/05/2026")
        ->assertStatus(422);
});

it('returns open attendances with null check_out', function () {
    insertAttendance($this->user->id, '2026-05-21 09:00:00', null);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/attendances?date=2026-05-21");

    $response->assertOk();
    expect($response->json('data.0.check_out'))->toBeNull();
});
