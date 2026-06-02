<?php

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

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
