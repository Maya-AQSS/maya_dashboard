<?php

namespace App\Services\Contracts;

use App\DataTransferObjects\AlertRuleDto;

interface AlertRuleServiceInterface
{
    /**
     * @return list<AlertRuleDto>
     */
    public function list(): array;

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
