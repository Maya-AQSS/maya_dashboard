<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\ApplicationDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property ApplicationDto $resource
 */
class ApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ApplicationDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'name' => $dto->name,
            'slug' => $dto->slug,
            'description' => $dto->description,
            'traefik_url' => $dto->traefikUrl,
            'is_active' => $dto->isActive,
            'is_favorite' => $dto->isFavorite,
            'view_permission_slug' => $dto->viewPermissionSlug,
        ];
    }
}
