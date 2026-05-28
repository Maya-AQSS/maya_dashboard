<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\PanelAlertRule;
use Generator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PanelAlertRuleRepositoryInterface
{
    /**
     * @return LengthAwarePaginator<PanelAlertRule>
     */
    public function paginate(int $perPage): LengthAwarePaginator;

    public function findOrFail(int $id): PanelAlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): PanelAlertRule;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(PanelAlertRule $rule, array $attributes): PanelAlertRule;

    public function delete(PanelAlertRule $rule): void;

    /**
     * Yields all active rules (is_active = true) for evaluation.
     *
     * @return Generator<PanelAlertRule>
     */
    public function cursorActive(): Generator;
}
