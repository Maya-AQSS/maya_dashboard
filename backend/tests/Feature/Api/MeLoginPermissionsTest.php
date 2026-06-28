<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\DB;
use Maya\Auth\Middleware\JwtMiddleware;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['cache.default' => 'array']);
    $this->withoutMiddleware([JwtMiddleware::class]);

    $this->user = User::factory()->create();

    $userId = $this->user->id;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', [
            'id'  => $userId,
            'sub' => $userId,
        ]);
    });
});

it('exposes cross-app login permissions in GET me permissions array', function () {
    DB::table('user_resolved_permissions')->insert([
        ['user_id' => $this->user->id, 'permission_slug' => 'dashboard.login'],
        ['user_id' => $this->user->id, 'permission_slug' => 'logs.login'],
        ['user_id' => $this->user->id, 'permission_slug' => 'dms.login'],
    ]);

    $response = $this->getJson('/api/v1/me');

    $response->assertOk();
    $permissions = $response->json('data.permissions');
    expect($permissions)->toContain('dashboard.login', 'logs.login', 'dms.login');
});
