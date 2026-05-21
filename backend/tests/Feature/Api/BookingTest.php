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

function insertBooking(string $userId, string $startAt, string $endAt, array $overrides = []): void
{
    DB::table('bookings')->insert(array_merge([
        'id' => uniqid('bk_', true),
        'user_id' => $userId,
        'title' => 'Reserva',
        'resource_id' => 'room-1',
        'resource_name' => 'Sala 1',
        'start_at' => $startAt,
        'end_at' => $endAt,
        'all_day' => false,
        'status' => 'confirmed',
    ], $overrides));
}

it('returns empty list when no bookings overlap the range', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21&to=2026-05-21")
        ->assertOk()
        ->assertJson(['data' => [], 'meta' => ['from' => '2026-05-21', 'to' => '2026-05-21', 'count' => 0]]);
});

it('returns bookings overlapping the requested range', function () {
    insertBooking($this->user->id, '2026-05-21 09:00:00', '2026-05-21 11:00:00');
    insertBooking($this->user->id, '2026-05-22 14:00:00', '2026-05-22 16:00:00');
    insertBooking($this->user->id, '2026-05-25 09:00:00', '2026-05-25 11:00:00'); // fuera

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21&to=2026-05-22");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('meta.count'))->toBe(2);
});

it('includes bookings that straddle the range boundaries', function () {
    insertBooking($this->user->id, '2026-05-20 22:00:00', '2026-05-21 02:00:00');
    insertBooking($this->user->id, '2026-05-21 23:00:00', '2026-05-22 03:00:00');

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21&to=2026-05-21");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('does not return bookings of other users', function () {
    $other = User::factory()->create();
    insertBooking($other->id, '2026-05-21 09:00:00', '2026-05-21 11:00:00');

    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21&to=2026-05-21")
        ->assertOk()
        ->assertJson(['data' => []]);
});

it('rejects requests missing the from or to params', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21")
        ->assertStatus(422);
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?to=2026-05-21")
        ->assertStatus(422);
});

it('rejects when to is before from', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-22&to=2026-05-21")
        ->assertStatus(422);
});

it('rejects unknown view value', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21&to=2026-05-21&view=year")
        ->assertStatus(422);
});

it('orders results by start_at ascending', function () {
    insertBooking($this->user->id, '2026-05-21 14:00:00', '2026-05-21 16:00:00', ['title' => 'tarde']);
    insertBooking($this->user->id, '2026-05-21 09:00:00', '2026-05-21 11:00:00', ['title' => 'manana']);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/bookings?from=2026-05-21&to=2026-05-21");

    $response->assertOk();
    expect($response->json('data.0.title'))->toBe('manana');
    expect($response->json('data.1.title'))->toBe('tarde');
});
