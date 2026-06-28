<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\UserFavoriteApplicationDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property UserFavoriteApplicationDto $resource
 */
class UserFavoriteApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var UserFavoriteApplicationDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'name' => $dto->name,
            'slug' => $dto->slug,
            'icon' => $dto->icon,
            'color' => $dto->color,
            'traefik_url' => $dto->traefikUrl,
        ];
    }
}
