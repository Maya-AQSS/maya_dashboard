<?php

use App\Models\Application;
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
            'id'  => $userId,
            'sub' => $userId,
        ]);
    });
});

function makeApplication(array $overrides = []): Application
{
    static $counter = 0;
    $counter++;

    return Application::create(array_merge([
        'name'        => "App {$counter}",
        'slug'        => "app-{$counter}",
        'description' => "Description for app {$counter}",
        'traefik_url' => "https://app-{$counter}.maya.test",
        'is_active'   => true,
    ], $overrides));
}

// ─── index ────────────────────────────────────────────────────────────────────

it('returns active applications for the user', function () {
    makeApplication(['is_active' => true, 'view_permission_slug' => null]);
    makeApplication(['is_active' => true, 'view_permission_slug' => null]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('only returns applications whose view_permission_slug the user has in FDW', function () {
    $visible = makeApplication([
        'slug'                 => 'maya-logs',
        'view_permission_slug' => 'logs.login',
        'is_active'            => true,
    ]);
    makeApplication([
        'slug'                 => 'maya-dms',
        'view_permission_slug' => 'dms.login',
        'is_active'            => true,
    ]);

    DB::table('user_resolved_permissions')->insert([
        'user_id'         => $this->user->id,
        'permission_slug' => 'logs.login',
    ]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.id'))->toBe($visible->id);
    expect($response->json('data.0.view_permission_slug'))->toBe('logs.login');
});

it('excludes inactive applications', function () {
    makeApplication(['is_active' => true]);
    makeApplication(['is_active' => false]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.is_active'))->toBeTrue();
});

it('returns empty list when no active applications exist', function () {
    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(0);
});

it('marks is_favorite as true for user favorites', function () {
    $app = makeApplication(['is_active' => true]);
    $this->user->favoriteApplications()->attach($app->id);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    $appData = collect($response->json('data'))->firstWhere('id', $app->id);
    expect($appData['is_favorite'])->toBeTrue();
});

it('marks is_favorite as false for non-favorite applications', function () {
    makeApplication(['is_active' => true]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    expect($response->json('data.0.is_favorite'))->toBeFalse();
});

it('favorite flag is user-specific — other user favorites do not affect result', function () {
    $app  = makeApplication(['is_active' => true]);
    $other = User::factory()->create();
    $other->favoriteApplications()->attach($app->id);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    $appData = collect($response->json('data'))->firstWhere('id', $app->id);
    expect($appData['is_favorite'])->toBeFalse();
});

it('response contains expected application fields', function () {
    makeApplication([
        'name'        => 'Named App',
        'slug'        => 'named-app',
        'description' => 'A description',
        'traefik_url' => 'https://named-app.test',
        'is_active'   => true,
    ]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    $app = $response->json('data.0');
    expect($app)->toHaveKeys(['id', 'name', 'slug', 'description', 'traefik_url', 'is_active', 'is_favorite', 'view_permission_slug']);
    expect($app['name'])->toBe('Named App');
    expect($app['slug'])->toBe('named-app');
});

it('applications are ordered by name', function () {
    makeApplication(['name' => 'Zebra App', 'slug' => 'zebra-app', 'is_active' => true]);
    makeApplication(['name' => 'Alpha App', 'slug' => 'alpha-app', 'is_active' => true]);
    makeApplication(['name' => 'Middle App', 'slug' => 'middle-app', 'is_active' => true]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    $names = collect($response->json('data'))->pluck('name')->values()->all();
    expect($names[0])->toBe('Alpha App');
    expect($names[1])->toBe('Middle App');
    expect($names[2])->toBe('Zebra App');
});

it('respects per_page parameter', function () {
    foreach (range(1, 5) as $_) {
        makeApplication(['is_active' => true]);
    }

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications?per_page=2");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('total'))->toBe(5);
});

it('caps per_page at 200', function () {
    foreach (range(1, 3) as $_) {
        makeApplication(['is_active' => true]);
    }

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications?per_page=9999");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(3);
});

it('returns null traefik_url when not set', function () {
    makeApplication([
        'traefik_url' => null,
        'is_active'   => true,
    ]);

    $response = $this->getJson("/api/v1/dashboard/user/{$this->user->id}/applications");

    $response->assertOk();
    expect($response->json('data.0.traefik_url'))->toBeNull();
});
