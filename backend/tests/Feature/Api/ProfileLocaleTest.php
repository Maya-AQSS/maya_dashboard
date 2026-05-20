<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['cache.default' => 'array']);
    $this->withoutMiddleware(\Maya\Auth\Middleware\JwtMiddleware::class);
    $this->user = User::factory()->create();

    DB::table('user_resolved_permissions')->insert([
        'user_id'         => $this->user->id,
        'permission_slug' => 'profile.update',
    ]);

    $userId = $this->user->id;
    $this->app['events']->listen(RouteMatched::class, function ($event) use ($userId) {
        $event->request->attributes->set('jwt_user', [
            'id'  => $userId,
            'sub' => $userId,
        ]);
    });
});

it('allows locale update with profile.update', function () {
    $this->putJson('/api/v1/me/locale', ['locale' => 'es'])
        ->assertOk();
});

it('denies locale update without profile.update', function () {
    DB::table('user_resolved_permissions')
        ->where('user_id', $this->user->id)
        ->where('permission_slug', 'profile.update')
        ->delete();

    $this->putJson('/api/v1/me/locale', ['locale' => 'es'])
        ->assertForbidden();
});

it('allows GET me without profile.show', function () {
    DB::table('user_resolved_permissions')
        ->where('user_id', $this->user->id)
        ->delete();

    $this->getJson('/api/v1/me')
        ->assertOk();
});
