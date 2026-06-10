<?php

use App\DTOs\NotificationFilterDto;
use App\Models\Notification;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('searches notifications across title, body and i18n keys/params', function () {
    $rid = (string) Str::uuid();

    // Alertas manuales (texto libre)
    Notification::factory()->create(['recipient_id' => $rid, 'title' => 'Contiene zzqq aquí', 'body' => 'x']);
    Notification::factory()->create(['recipient_id' => $rid, 'title' => 't', 'body' => 'el cuerpo tiene zzqq dentro']);
    // Notificaciones de sistema (claves i18n + params): el bug era que NO se buscaban
    Notification::factory()->create([
        'recipient_id' => $rid, 'title' => null, 'body' => null,
        'title_key' => 'notifications.zzqq.title', 'body_key' => null, 'params' => null,
    ]);
    Notification::factory()->create([
        'recipient_id' => $rid, 'title' => null, 'body' => null,
        'title_key' => 'notifications.foo.title', 'body_key' => 'notifications.foo.body',
        'params' => ['document_title' => 'Informe zzqq Q3'],
    ]);
    // No coincide
    Notification::factory()->create(['recipient_id' => $rid, 'title' => 'nada', 'body' => 'sin relación']);

    $repo = app(NotificationRepositoryInterface::class);
    $page = $repo->paginateForRecipient($rid, new NotificationFilterDto(perPage: 50, search: 'zzqq'));

    // 4 coincidencias (title, body, title_key, params); la 5ª no coincide.
    expect($page->total())->toBe(4);
});

it('notification search is case-insensitive', function () {
    $rid = (string) Str::uuid();
    Notification::factory()->create(['recipient_id' => $rid, 'title' => 'ZZQQ Mayúsculas', 'body' => 'x']);
    Notification::factory()->create(['recipient_id' => $rid, 'title' => 'otra', 'body' => 'y']);

    $repo = app(NotificationRepositoryInterface::class);
    $page = $repo->paginateForRecipient($rid, new NotificationFilterDto(perPage: 50, search: 'zzqq'));

    expect($page->total())->toBe(1);
});

it('delegates user existence checks to UserRepository', function () {
    $userId = (string) Str::uuid();
    User::forceCreate([
        'id' => $userId,
        'email' => 'exists@test.local',
        'name' => 'Exists User',
        'is_active' => true,
    ]);

    $users = Mockery::mock(UserRepositoryInterface::class);
    $users->shouldReceive('exists')->once()->with($userId)->andReturn(true);

    $repo = new \App\Repositories\Eloquent\NotificationRepository($users);

    expect($repo->userExists($userId))->toBeTrue();
});

it('UserRepository exists returns false for unknown ids', function () {
    $repo = new UserRepository();

    expect($repo->exists((string) Str::uuid()))->toBeFalse();
});
