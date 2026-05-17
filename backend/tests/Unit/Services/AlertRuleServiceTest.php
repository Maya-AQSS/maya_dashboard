<?php

use App\DTOs\AlertRuleDto;
use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Alerts\AlertRuleService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

function makeAlertRuleModel(array $attributes = []): AlertRule
{
    $suffix = substr((string) Str::uuid(), 0, 8);

    return AlertRule::make(array_merge([
        'id'               => rand(1, 9999),
        'slug'             => 'rule-' . $suffix,
        'name'             => 'Rule ' . $suffix,
        'description'      => null,
        'query_sql'        => 'SELECT 1',
        'severity'         => 'high',
        'schedule_cron'    => null,
        'enabled'          => true,
        'context_template' => [],
        'last_evaluated_at' => null,
        'created_at'       => now(),
        'updated_at'       => now(),
    ], $attributes));
}

// ─── list ─────────────────────────────────────────────────────────────────────

it('list returns a paginator of AlertRuleDto', function () {
    $model = makeAlertRuleModel(['slug' => 'test-slug', 'severity' => 'critical']);

    $collection = new Collection([$model]);
    $paginator = new LengthAwarePaginator($collection, 1, 100);

    $repo = Mockery::mock(AlertRuleRepositoryInterface::class);
    $repo->shouldReceive('paginateOrderedBySlug')->once()->with(100)->andReturn($paginator);

    $service = new AlertRuleService($repo);
    $result  = $service->list(100);

    expect($result)->toBeInstanceOf(LengthAwarePaginator::class);
    expect($result->total())->toBe(1);

    $dto = $result->getCollection()->first();
    expect($dto)->toBeInstanceOf(AlertRuleDto::class);
    expect($dto->slug)->toBe('test-slug');
    expect($dto->severity)->toBe('critical');
});

it('list transforms all models in the paginator collection to DTOs', function () {
    $models = collect([
        makeAlertRuleModel(['slug' => 'a-rule']),
        makeAlertRuleModel(['slug' => 'b-rule']),
    ]);
    $paginator = new LengthAwarePaginator($models, 2, 100);

    $repo = Mockery::mock(AlertRuleRepositoryInterface::class);
    $repo->shouldReceive('paginateOrderedBySlug')->andReturn($paginator);

    $service = new AlertRuleService($repo);
    $result  = $service->list();

    $result->getCollection()->each(fn ($item) => expect($item)->toBeInstanceOf(AlertRuleDto::class));
    expect($result->getCollection())->toHaveCount(2);
});

// ─── create ───────────────────────────────────────────────────────────────────

it('create calls repository and returns an AlertRuleDto', function () {
    $model = makeAlertRuleModel(['slug' => 'new-rule', 'name' => 'New Rule']);

    $attributes = ['slug' => 'new-rule', 'name' => 'New Rule', 'query_sql' => 'SELECT 1', 'severity' => 'high'];

    $repo = Mockery::mock(AlertRuleRepositoryInterface::class);
    $repo->shouldReceive('create')->once()->with($attributes)->andReturn($model);

    $service = new AlertRuleService($repo);
    $dto     = $service->create($attributes);

    expect($dto)->toBeInstanceOf(AlertRuleDto::class);
    expect($dto->slug)->toBe('new-rule');
    expect($dto->name)->toBe('New Rule');
});

// ─── update ───────────────────────────────────────────────────────────────────

it('update calls findOrFail then repository update and returns DTO', function () {
    $ruleId  = 42;
    $original = makeAlertRuleModel(['id' => $ruleId, 'severity' => 'low']);
    $updated  = makeAlertRuleModel(['id' => $ruleId, 'severity' => 'critical']);

    $repo = Mockery::mock(AlertRuleRepositoryInterface::class);
    $repo->shouldReceive('findOrFail')->once()->with($ruleId)->andReturn($original);
    $repo->shouldReceive('update')->once()->with($original, ['severity' => 'critical'])->andReturn($updated);

    $service = new AlertRuleService($repo);
    $dto     = $service->update($ruleId, ['severity' => 'critical']);

    expect($dto)->toBeInstanceOf(AlertRuleDto::class);
    expect($dto->severity)->toBe('critical');
});

// ─── delete ───────────────────────────────────────────────────────────────────

it('delete calls findOrFail then repository delete', function () {
    $ruleId = 10;
    $model  = makeAlertRuleModel(['id' => $ruleId]);

    $repo = Mockery::mock(AlertRuleRepositoryInterface::class);
    $repo->shouldReceive('findOrFail')->once()->with($ruleId)->andReturn($model);
    $repo->shouldReceive('delete')->once()->with($model);

    $service = new AlertRuleService($repo);
    $service->delete($ruleId);
});
