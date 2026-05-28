<?php

declare(strict_types=1);

namespace App\DTOs;

use Maya\Http\Data\FilterDto;

/**
 * Criterios de filtrado y paginación para el listado de alertas.
 */
readonly class AlertFilterDto extends FilterDto
{
    public function __construct(
        public readonly ?string $severity = null,
        public readonly bool $activeOnly = true,
        int $page = 1,
        int $perPage = 25,
        ?string $sortBy = 'created_at',
        string $sortDir = 'desc',
        ?string $search = null,
    ) {
        parent::__construct($page, $perPage, $sortBy, $sortDir, $search);
    }
}
