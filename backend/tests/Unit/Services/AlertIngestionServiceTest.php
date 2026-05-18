<?php

use App\Models\AlertRule;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Services\Alerts\AlertIngestionService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// ─── ingest ───────────────────────────────────────────────────────────────────

it('throws ValidationException when message_id is not a UUID', function () {
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    expect(fn () => $service->ingest([
        'rule_slug' => 'cpu-high',
        'severity'  => 'critical',
        'title'     => 'Test',
        'source'    => 'app.publish',
        'context'   => [],
    ], 'not-a-uuid'))
        ->toThrow(ValidationException::class);
});

it('throws ValidationException when message_id is empty', function () {
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    expect(fn () => $service->ingest([
        'severity' => 'high',
        'title'    => 'Test',
        'context'  => [],
    ], ''))
        ->toThrow(ValidationException::class);
});

it('upserts alert with valid rule_slug when slug exists in cache', function () {
    $messageId = (string) Str::uuid();
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);

    // Cache the valid slugs lookup
    Cache::put(AlertRule::VALID_SLUGS_CACHE_KEY, ['cpu-high' => 0]);

    $alertRepo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['rule_slug'] === 'cpu-high' && $args['severity'] === 'critical'));

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    $service->ingest([
        'rule_slug' => 'cpu-high',
        'severity'  => 'critical',
        'title'     => 'CPU Alert',
        'source'    => 'metric.threshold',
        'context'   => ['host' => 'web-01'],
        'created_at' => '2026-05-10T12:00:00Z',
    ], $messageId);
});

it('sets rule_slug to null for unknown slug (orphan alert)', function () {
    $messageId = (string) Str::uuid();
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);

    // Cache with only known slug
    Cache::put(AlertRule::VALID_SLUGS_CACHE_KEY, ['known-slug' => 0]);

    $alertRepo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['rule_slug'] === null));

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    $service->ingest([
        'rule_slug' => 'unknown-slug',
        'severity'  => 'low',
        'title'     => 'Orphan Alert',
        'source'    => 'app.publish',
        'context'   => [],
    ], $messageId);
});

it('sets rule_slug to null when payload rule_slug is null', function () {
    $messageId = (string) Str::uuid();
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);
    Cache::put(AlertRule::VALID_SLUGS_CACHE_KEY, []);

    $alertRepo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['rule_slug'] === null));

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    $service->ingest([
        'rule_slug' => null,
        'severity'  => 'low',
        'title'     => 'No Rule Alert',
        'source'    => 'system',
        'context'   => [],
    ], $messageId);
});

it('calls ruleRepo->validSlugLookup() when cache is empty', function () {
    $messageId = (string) Str::uuid();
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);

    Cache::forget(AlertRule::VALID_SLUGS_CACHE_KEY);

    $ruleRepo->shouldReceive('validSlugLookup')
        ->once()
        ->andReturn(['cpu-high' => 0]);

    $alertRepo->shouldReceive('upsertByMessageId')->once();

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    $service->ingest([
        'rule_slug' => 'cpu-high',
        'severity'  => 'high',
        'title'     => 'CPU',
        'source'    => 'app.publish',
        'context'   => [],
        'created_at' => '2026-05-10T12:00:00Z',
    ], $messageId);
});

it('uses created_at from payload when provided', function () {
    $messageId = (string) Str::uuid();
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);
    Cache::put(AlertRule::VALID_SLUGS_CACHE_KEY, []);

    $alertRepo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['created_at']->toIso8601String() === '2026-05-10T12:00:00+00:00'));

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    $service->ingest([
        'severity'   => 'medium',
        'title'      => 'Test',
        'source'     => 'app.publish',
        'context'    => [],
        'created_at' => '2026-05-10T12:00:00Z',
    ], $messageId);
});

it('uses now() as created_at when payload does not include it', function () {
    $messageId = (string) Str::uuid();
    $alertRepo = Mockery::mock(AlertRepositoryInterface::class);
    $ruleRepo  = Mockery::mock(AlertRuleRepositoryInterface::class);
    Cache::put(AlertRule::VALID_SLUGS_CACHE_KEY, []);

    $alertRepo->shouldReceive('upsertByMessageId')
        ->once()
        ->with($messageId, Mockery::on(fn ($args) => $args['created_at'] !== null));

    $service = new AlertIngestionService($alertRepo, $ruleRepo);

    $service->ingest([
        'severity' => 'high',
        'title'    => 'No Date Alert',
        'source'   => 'app.publish',
        'context'  => [],
    ], $messageId);
});
