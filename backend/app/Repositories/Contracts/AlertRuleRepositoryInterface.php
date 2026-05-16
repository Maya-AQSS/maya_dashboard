<?php
declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\AlertRule;
use Generator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRuleRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<AlertRule>
     */
    public function paginateOrderedBySlug(int $perPage = 100): LengthAwarePaginator;

    public function findOrFail(int $ruleId): AlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): AlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(AlertRule $rule, array $attributes): AlertRule;

    public function delete(AlertRule $rule): void;

    /**
     * Streams every enabled rule for the alerts:evaluate command.
     *
     * @return Generator<AlertRule>
     */
    public function cursorActive(): Generator;

    /**
     * Stamps last_evaluated_at on the given rule ids.
     *
     * @param  list<int>  $ruleIds
     */
    public function markEvaluated(array $ruleIds, \DateTimeInterface $at): int;

    /**
     * Returns the slugs of every persisted rule as a flipped lookup map (slug → true).
     * Used by AlertIngestion to decide whether an incoming alert can be FK-linked.
     *
     * @return array<string, true>
     */
    public function validSlugLookup(): array;
}
