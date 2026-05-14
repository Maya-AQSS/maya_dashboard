<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Application;

final readonly class UserFavoriteApplicationDto
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public ?string $traefikUrl,
    ) {}

    public static function fromModel(Application $m): self
    {
        return new self(
            id: (int) $m->id,
            name: (string) $m->name,
            slug: (string) $m->slug,
            traefikUrl: $m->traefik_url,
        );
    }
}
