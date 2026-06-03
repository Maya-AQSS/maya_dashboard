<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\PanelAlertRuleDto;
use Maya\Http\Pagination\PaginatedDto;

interface PanelAlertRuleServiceInterface
{
    /**
     * @return PaginatedDto<PanelAlertRuleDto>
     */
    public function paginate(int $perPage): PaginatedDto;

    public function find(int $id): PanelAlertRuleDto;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, string $createdBy): PanelAlertRuleDto;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data, string $updatedBy): PanelAlertRuleDto;

    public function delete(int $id): void;
}
