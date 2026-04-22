<?php

use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);
    $this->user = User::factory()->create();
    $this->other = User::factory()->create();
});

it('returns an empty list when user has no favorites', function () {
    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/favorites")
        ->assertOk()
        ->assertJson(['data' => []]);
});

it('returns the user favorite applications', function () {
    $app = Application::create(['name' => 'App One', 'slug' => 'app-one']);
    $this->user->favoriteApplications()->attach($app->id);

    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/favorites")
        ->assertOk()
        ->assertJsonFragment(['id' => $app->id, 'name' => 'App One', 'slug' => 'app-one']);
});

it('adds an application to favorites', function () {
    $app = Application::create(['name' => 'App Two', 'slug' => 'app-two']);

    $this->postJson("/api/v1/dashboard/user/{$this->user->id}/favorites", [
        'application_id' => $app->id,
    ])->assertOk();

    expect($this->user->favoriteApplications()->where('application_id', $app->id)->exists())->toBeTrue();
});

it('is idempotent when adding the same application twice', function () {
    $app = Application::create(['name' => 'App Three', 'slug' => 'app-three']);
    $this->user->favoriteApplications()->attach($app->id);

    $this->postJson("/api/v1/dashboard/user/{$this->user->id}/favorites", [
        'application_id' => $app->id,
    ])->assertOk();

    expect($this->user->favoriteApplications()->where('application_id', $app->id)->count())->toBe(1);
});

it('removes an application from favorites', function () {
    $app = Application::create(['name' => 'App Four', 'slug' => 'app-four']);
    $this->user->favoriteApplications()->attach($app->id);

    $this->deleteJson("/api/v1/dashboard/user/{$this->user->id}/favorites/{$app->id}")
        ->assertNoContent();

    expect($this->user->favoriteApplications()->where('application_id', $app->id)->exists())->toBeFalse();
});

it('returns 404 when removing a non-existing favorite', function () {
    $this->deleteJson("/api/v1/dashboard/user/{$this->user->id}/favorites/9999")
        ->assertNotFound();
});

it('does not expose favorites of another user', function () {
    $app = Application::create(['name' => 'App Five', 'slug' => 'app-five']);
    $this->other->favoriteApplications()->attach($app->id);

    $this->getJson("/api/v1/dashboard/user/{$this->user->id}/favorites")
        ->assertOk()
        ->assertJson(['data' => []]);
});

it('rejects invalid application_id on store', function () {
    $this->postJson("/api/v1/dashboard/user/{$this->user->id}/favorites", [
        'application_id' => 99999,
    ])->assertUnprocessable();
});
