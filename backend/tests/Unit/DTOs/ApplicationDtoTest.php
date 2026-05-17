<?php

use App\DTOs\ApplicationDto;
use App\Models\Application;

it('creates ApplicationDto from model with all fields', function () {
    $model = Application::make([
        'name'        => 'Authorization',
        'slug'        => 'maya-authorization',
        'description' => 'User auth app',
        'traefik_url' => 'https://auth.maya.test',
        'is_active'   => true,
    ]);
    // id is the primary key and not in fillable — set via setAttribute
    $model->setAttribute('id', 1);
    // is_favorite comes from a raw query select, simulate it as attribute
    $model->setAttribute('is_favorite', true);

    $dto = ApplicationDto::fromModel($model);

    expect($dto->id)->toBe(1);
    expect($dto->name)->toBe('Authorization');
    expect($dto->slug)->toBe('maya-authorization');
    expect($dto->description)->toBe('User auth app');
    expect($dto->traefikUrl)->toBe('https://auth.maya.test');
    expect($dto->isActive)->toBeTrue();
    expect($dto->isFavorite)->toBeTrue();
});

it('defaults isFavorite to false when is_favorite attribute is null', function () {
    $model = Application::make([
        'name'      => 'Logs',
        'slug'      => 'maya-logs',
        'is_active' => true,
    ]);
    // is_favorite not set — simulates left join with no match

    $dto = ApplicationDto::fromModel($model);

    expect($dto->isFavorite)->toBeFalse();
});

it('handles null description and null traefik_url', function () {
    $model = Application::make([
        'name'        => 'DMS',
        'slug'        => 'maya-dms',
        'description' => null,
        'traefik_url' => null,
        'is_active'   => false,
    ]);

    $dto = ApplicationDto::fromModel($model);

    expect($dto->description)->toBeNull();
    expect($dto->traefikUrl)->toBeNull();
    expect($dto->isActive)->toBeFalse();
});

it('ApplicationDto is immutable (readonly)', function () {
    $dto = new ApplicationDto(
        id: 1,
        name: 'Test',
        slug: 'test',
        description: null,
        traefikUrl: null,
        isActive: true,
        isFavorite: false,
    );

    expect(fn () => $dto->id = 999)->toThrow(Error::class);
});
