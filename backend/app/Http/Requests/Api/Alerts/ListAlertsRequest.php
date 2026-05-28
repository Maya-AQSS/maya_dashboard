<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Alerts;

use App\DTOs\AlertFilterDto;
use Maya\Http\Http\Requests\PaginatedFilterRequest;

class ListAlertsRequest extends PaginatedFilterRequest
{
    /**
     * @return array<string, list<mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'severity'    => ['nullable', 'string', 'in:critical,high,medium,low'],
            'active_only' => ['nullable', 'boolean'],
        ];
    }

    public function toFilterDto(): AlertFilterDto
    {
        return new AlertFilterDto(
            severity: $this->input('severity') ?: null,
            activeOnly: (bool) $this->input('active_only', true),
            page: $this->getPage(),
            perPage: $this->getPerPage() > 0 ? $this->getPerPage() : 25,
            sortBy: $this->getSortBy() ?? 'created_at',
            sortDir: $this->getSortDir(),
            search: $this->input('search') ?: null,
        );
    }
}
