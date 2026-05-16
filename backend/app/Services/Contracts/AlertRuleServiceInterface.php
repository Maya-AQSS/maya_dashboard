<?php

namespace App\Services\Contracts;

use App\DataTransferObjects\AlertRuleDto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRuleServiceInterface
{
    /**
     * @return LengthAwarePaginator<AlertRuleDto>
     */
    public function list(int $perPage = 100): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): AlertRuleDto;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(int $ruleId, array $attributes): AlertRuleDto;

    public function delete(int $ruleId): void;
}
