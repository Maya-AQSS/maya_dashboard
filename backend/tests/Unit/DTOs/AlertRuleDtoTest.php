<?php

use App\DTOs\AlertRuleDto;
use App\Models\AlertRule;

it('creates AlertRuleDto from model with all fields populated', function () {
    $model = AlertRule::make([
        'slug'             => 'cpu-alert',
        'name'             => 'CPU Alert',
        'description'      => 'Monitors CPU usage',
        'query_sql'        => 'SELECT count(*) FROM metrics',
        'severity'         => 'critical',
        'schedule_cron'    => '*/5 * * * *',
        'enabled'          => true,
        'context_template' => ['sample_columns' => ['id', 'value']],
    ]);
    $model->setAttribute('id', 1);

    $dto = AlertRuleDto::fromModel($model);

    expect($dto->id)->toBe(1);
    expect($dto->slug)->toBe('cpu-alert');
    expect($dto->name)->toBe('CPU Alert');
    expect($dto->description)->toBe('Monitors CPU usage');
    expect($dto->querySql)->toBe('SELECT count(*) FROM metrics');
    expect($dto->severity)->toBe('critical');
    expect($dto->scheduleCron)->toBe('*/5 * * * *');
    expect($dto->enabled)->toBeTrue();
    expect($dto->contextTemplate)->toBe(['sample_columns' => ['id', 'value']]);
});

it('creates AlertRuleDto with null optional fields', function () {
    $model = AlertRule::make([
        'slug'          => 'null-rule',
        'name'          => 'Null Rule',
        'description'   => null,
        'query_sql'     => 'SELECT 1',
        'severity'      => 'low',
        'schedule_cron' => null,
        'enabled'       => false,
    ]);
    $model->setAttribute('id', 2);

    $dto = AlertRuleDto::fromModel($model);

    expect($dto->description)->toBeNull();
    expect($dto->scheduleCron)->toBeNull();
    expect($dto->enabled)->toBeFalse();
    expect($dto->lastEvaluatedAt)->toBeNull();
    expect($dto->createdAt)->toBeNull();
    expect($dto->updatedAt)->toBeNull();
});

it('defaults context_template to empty array when model has null', function () {
    $model = AlertRule::make([
        'slug'     => 'no-template',
        'name'     => 'No Template',
        'query_sql' => 'SELECT 1',
        'severity'  => 'high',
        'enabled'   => true,
        'context_template' => null,
    ]);
    $model->setAttribute('id', 3);

    $dto = AlertRuleDto::fromModel($model);

    expect($dto->contextTemplate)->toBe([]);
});

it('formats last_evaluated_at as ISO 8601 string when set', function () {
    $model = AlertRule::make([
        'slug'             => 'evaluated-rule',
        'name'             => 'Evaluated Rule',
        'query_sql'        => 'SELECT 1',
        'severity'         => 'medium',
        'enabled'          => true,
        'context_template' => [],
        'last_evaluated_at' => '2026-05-10 12:00:00',
    ]);
    $model->setAttribute('id', 4);

    $dto = AlertRuleDto::fromModel($model);

    expect($dto->lastEvaluatedAt)->not->toBeNull();
    expect($dto->lastEvaluatedAt)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/');
});

it('AlertRuleDto is immutable (readonly)', function () {
    $dto = new AlertRuleDto(
        id: 1,
        slug: 'test',
        name: 'Test',
        description: null,
        querySql: 'SELECT 1',
        severity: 'low',
        scheduleCron: null,
        enabled: true,
        contextTemplate: [],
        lastEvaluatedAt: null,
        createdAt: null,
        updatedAt: null,
    );

    expect(fn () => $dto->id = 999)->toThrow(Error::class);
});
