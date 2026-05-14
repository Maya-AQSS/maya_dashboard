<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\UserDashboardLayout;

final readonly class UserDashboardLayoutDto
{
    /**
     * @param  array<int, mixed>  $layout
     */
    public function __construct(
        public array $layout,
        public ?string $updatedAt,
    ) {}

    public static function fromModel(UserDashboardLayout $m): self
    {
        return new self(
            layout: is_array($m->layout) ? $m->layout : [],
            updatedAt: $m->updated_at?->toIso8601String(),
        );
    }
}
