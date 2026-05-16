<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Models\Application;

final readonly class ApplicationDto
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public ?string $description,
        public ?string $traefikUrl,
        public bool $isActive,
        public bool $isFavorite,
    ) {}

    public static function fromModel(Application $m): self
    {
        return new self(
            id: (int) $m->id,
            name: (string) $m->name,
            slug: (string) $m->slug,
            description: $m->description,
            traefikUrl: $m->traefik_url,
            isActive: (bool) $m->is_active,
            isFavorite: (bool) ($m->is_favorite ?? false),
        );
    }
}
