<?php

use App\Models\AlertRule;
use App\Repositories\Eloquent\AlertRuleRepository;

// ─── paginateOrderedBySlug ────────────────────────────────────────────────────

it('paginateOrderedBySlug returns results ordered by slug', function () {
    AlertRule::factory()->create(['slug' => 'z-rule', 'name' => 'Z Rule']);
    AlertRule::factory()->create(['slug' => 'a-rule', 'name' => 'A Rule']);

    $repo   = new AlertRuleRepository;
    $result = $repo->paginateOrderedBySlug(100);

    expect($result->items()[0]->slug)->toBe('a-rule');
    expect($result->items()[1]->slug)->toBe('z-rule');
});

it('paginateOrderedBySlug respects perPage argument', function () {
    AlertRule::factory()->count(5)->create();

    $repo   = new AlertRuleRepository;
    $result = $repo->paginateOrderedBySlug(2);

    expect($result->count())->toBe(2);
    expect($result->total())->toBe(5);
});

// ─── findOrFail ───────────────────────────────────────────────────────────────

it('findOrFail returns the model when it exists', function () {
    $rule = AlertRule::factory()->create(['slug' => 'find-me']);

    $repo  = new AlertRuleRepository;
    $found = $repo->findOrFail($rule->id);

    expect($found->id)->toBe($rule->id);
    expect($found->slug)->toBe('find-me');
});

it('findOrFail throws ModelNotFoundException when not found', function () {
    $repo = new AlertRuleRepository;

    expect(fn () => $repo->findOrFail(999999))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});

// ─── create ───────────────────────────────────────────────────────────────────

it('create persists a new AlertRule and returns it', function () {
    $repo = new AlertRuleRepository;
    $rule = $repo->create([
        'slug'      => 'new-alert',
        'name'      => 'New Alert',
        'query_sql' => 'SELECT count(*) FROM alerts',
        'severity'  => 'high',
        'enabled'   => true,
    ]);

    expect($rule)->toBeInstanceOf(AlertRule::class);
    expect($rule->exists)->toBeTrue();
    expect($rule->slug)->toBe('new-alert');
    expect(AlertRule::where('slug', 'new-alert')->exists())->toBeTrue();
});

// ─── update ───────────────────────────────────────────────────────────────────

it('update modifies the model and returns refreshed instance', function () {
    $rule = AlertRule::factory()->create(['severity' => 'low']);

    $repo    = new AlertRuleRepository;
    $updated = $repo->update($rule, ['severity' => 'critical']);

    expect($updated->severity)->toBe('critical');
    expect(AlertRule::find($rule->id)->severity)->toBe('critical');
});

// ─── delete ───────────────────────────────────────────────────────────────────

it('delete removes the model from the database', function () {
    $rule = AlertRule::factory()->create();
    $id   = $rule->id;

    $repo = new AlertRuleRepository;
    $repo->delete($rule);

    expect(AlertRule::find($id))->toBeNull();
});

// ─── cursorActive ─────────────────────────────────────────────────────────────

it('cursorActive yields only enabled alert rules', function () {
    AlertRule::factory()->create(['slug' => 'active-rule',   'enabled' => true]);
    AlertRule::factory()->create(['slug' => 'inactive-rule', 'enabled' => false]);

    $repo    = new AlertRuleRepository;
    $yielded = iterator_to_array($repo->cursorActive(), false);

    expect($yielded)->toHaveCount(1);
    expect($yielded[0]->slug)->toBe('active-rule');
});

it('cursorActive yields nothing when no rules are enabled', function () {
    AlertRule::factory()->create(['enabled' => false]);

    $repo    = new AlertRuleRepository;
    $yielded = iterator_to_array($repo->cursorActive(), false);

    expect($yielded)->toBeEmpty();
});

// ─── markEvaluated ───────────────────────────────────────────────────────────

it('markEvaluated updates last_evaluated_at for given rule ids', function () {
    $rule1 = AlertRule::factory()->create();
    $rule2 = AlertRule::factory()->create();

    $at   = now();
    $repo = new AlertRuleRepository;
    $count = $repo->markEvaluated([$rule1->id, $rule2->id], $at);

    expect($count)->toBe(2);
    expect(AlertRule::find($rule1->id)->last_evaluated_at)->not->toBeNull();
    expect(AlertRule::find($rule2->id)->last_evaluated_at)->not->toBeNull();
});

it('markEvaluated returns 0 and does nothing for empty id list', function () {
    AlertRule::factory()->create();

    $repo  = new AlertRuleRepository;
    $count = $repo->markEvaluated([], now());

    expect($count)->toBe(0);
});

// ─── validSlugLookup ─────────────────────────────────────────────────────────

it('validSlugLookup returns a flipped slug map', function () {
    AlertRule::factory()->create(['slug' => 'alpha-rule']);
    AlertRule::factory()->create(['slug' => 'beta-rule']);

    $repo   = new AlertRuleRepository;
    $lookup = $repo->validSlugLookup();

    expect($lookup)->toHaveKey('alpha-rule');
    expect($lookup)->toHaveKey('beta-rule');
});

it('validSlugLookup returns empty array when no rules exist', function () {
    $repo   = new AlertRuleRepository;
    $lookup = $repo->validSlugLookup();

    expect($lookup)->toBe([]);
});
