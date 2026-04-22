<?php

use App\Models\User;
use App\Models\UserDashboardLayout;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);
    $this->user = User::factory()->create();
});

it('returns default empty layout when none exists', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout")
        ->assertOk()
        ->assertJson(['layout' => []]);
});

it('returns the stored layout', function () {
    $layout = [['i' => 'widget-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 2]];
    UserDashboardLayout::create(['user_id' => $this->user->id, 'layout' => $layout]);

    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout")
        ->assertOk()
        ->assertJson(['layout' => $layout]);
});

it('creates a layout when none exists', function () {
    $layout = [['i' => 'widget-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 2]];

    $this->putJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout", [
        'layout' => $layout,
    ])->assertOk()->assertJson(['layout' => $layout]);

    expect(UserDashboardLayout::where('user_id', $this->user->id)->exists())->toBeTrue();
});

it('updates an existing layout', function () {
    $old = [['i' => 'widget-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 2]];
    UserDashboardLayout::create(['user_id' => $this->user->id, 'layout' => $old]);

    $new = [['i' => 'widget-2', 'x' => 1, 'y' => 0, 'w' => 6, 'h' => 3]];

    $this->putJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout", [
        'layout' => $new,
    ])->assertOk()->assertJson(['layout' => $new]);

    expect(UserDashboardLayout::where('user_id', $this->user->id)->count())->toBe(1);
});

it('rejects layout without required fields', function () {
    $this->putJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout", [
        'layout' => [['i' => 'widget-1']],
    ])->assertUnprocessable();
});

it('rejects negative coordinates', function () {
    $this->putJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout", [
        'layout' => [['i' => 'widget-1', 'x' => -1, 'y' => 0, 'w' => 4, 'h' => 2]],
    ])->assertUnprocessable();
});

it('response contains updated_at timestamp', function () {
    $layout = [['i' => 'widget-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 2]];

    $response = $this->putJson("/api/v1/dashboard/user/{$this->user->id}/dashboard-layout", [
        'layout' => $layout,
    ])->assertOk();

    expect($response->json('updated_at'))->not->toBeNull();
});
