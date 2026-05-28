<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Alerts;

use App\DTOs\AlertRuleFilterDto;
use Maya\Http\Http\Requests\PaginatedFilterRequest;

class ListAlertRulesRequest extends PaginatedFilterRequest
{
    /**
     * @return array<string, list<mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'enabled' => ['nullable', 'boolean'],
        ];
    }

    public function toFilterDto(): AlertRuleFilterDto
    {
        $enabled = $this->input('enabled');

        return new AlertRuleFilterDto(
            enabled: $enabled !== null ? (bool) $enabled : null,
            page: $this->getPage(),
            perPage: max(1, min($this->getPerPage(), 200)),
            sortBy: $this->getSortBy() ?? 'slug',
            sortDir: $this->getSortDir(),
            search: $this->input('search') ?: null,
        );
    }
}
