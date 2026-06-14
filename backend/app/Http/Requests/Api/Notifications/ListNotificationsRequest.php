<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Notifications;

use App\DTOs\NotificationFilterDto;
use Maya\Http\Http\Requests\PaginatedFilterRequest;

class ListNotificationsRequest extends PaginatedFilterRequest
{
    /**
     * @return array<string, list<mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'type' => ['nullable', 'string', 'max:64'],
            'app' => ['nullable', 'string', 'max:64'],
            'unread_only' => ['nullable', 'boolean'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'sort_by' => ['nullable', 'string', 'in:created_at,read_at'],
            'scope' => ['nullable', 'string', 'in:user,dashboard,both'],
            'is_critical' => ['nullable', 'boolean'],
            'acknowledged' => ['nullable', 'boolean'],
        ];
    }

    public function toFilterDto(): NotificationFilterDto
    {
        return new NotificationFilterDto(
            type: $this->input('type') ?: null,
            app: $this->input('app') ?: null,
            unreadOnly: (bool) $this->input('unread_only', false),
            dateFrom: $this->input('date_from') ?: null,
            dateTo: $this->input('date_to') ?: null,
            scope: $this->input('scope') ?: null,
            isCritical: $this->input('is_critical') !== null ? (bool) $this->input('is_critical') : null,
            acknowledged: $this->input('acknowledged') !== null ? (bool) $this->input('acknowledged') : null,
            page: $this->getPage(),
            // getPerPage() (base compartida) cae a 15 cuando no se envía per_page;
            // honrar 25 como default del dominio salvo valor explícito del cliente.
            perPage: $this->filled('per_page') ? $this->getPerPage() : 25,
            sortBy: $this->getSortBy() ?? 'created_at',
            sortDir: $this->getSortDir(),
            search: $this->input('search') ?: null,
        );
    }
}
