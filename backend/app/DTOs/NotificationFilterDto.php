<?php

declare(strict_types=1);

namespace App\DTOs;

use Maya\Http\Data\FilterDto;

/**
 * Criterios de filtrado y paginación para el listado de notificaciones.
 */
readonly class NotificationFilterDto extends FilterDto
{
    public function __construct(
        public readonly ?string $type = null,
        public readonly ?string $app = null,
        public readonly bool $unreadOnly = false,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null,
        int $page = 1,
        int $perPage = 25,
        ?string $sortBy = 'created_at',
        string $sortDir = 'desc',
        ?string $search = null,
    ) {
        parent::__construct($page, $perPage, $sortBy, $sortDir, $search);
    }
}
