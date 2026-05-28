<?php

declare(strict_types=1);

namespace App\DTOs;

use Maya\Http\Data\FilterDto;

/**
 * Criterios de filtrado y paginación para el listado de reglas de alerta.
 */
readonly class AlertRuleFilterDto extends FilterDto
{
    public function __construct(
        public readonly ?bool $enabled = null,
        int $page = 1,
        int $perPage = 100,
        ?string $sortBy = 'slug',
        string $sortDir = 'asc',
        ?string $search = null,
    ) {
        parent::__construct($page, $perPage, $sortBy, $sortDir, $search);
    }
}
