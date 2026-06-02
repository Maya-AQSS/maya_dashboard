<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\AlertRuleDto;
use App\DTOs\AlertRuleFilterDto;
use Maya\Http\Pagination\PaginatedDto;

interface AlertRuleServiceInterface
{
    /**
     * @return PaginatedDto<AlertRuleDto>
     */
    public function paginate(AlertRuleFilterDto $filter): PaginatedDto;

    public function find(int $ruleId): AlertRuleDto;

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
