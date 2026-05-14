<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DataTransferObjects\UserFavoriteApplicationDto;
use App\Models\Application;
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
        $dto = $this->resource instanceof Application
            ? UserFavoriteApplicationDto::fromModel($this->resource)
            : $this->resource;

        return [
            'id'          => $dto->id,
            'name'        => $dto->name,
            'slug'        => $dto->slug,
            'traefik_url' => $dto->traefikUrl,
        ];
    }
}
