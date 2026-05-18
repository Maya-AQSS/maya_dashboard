<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\UserDashboardLayoutDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property UserDashboardLayoutDto $resource
 */
class UserDashboardLayoutResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var UserDashboardLayoutDto $dto */
        $dto = $this->resource;

        return [
            'layout' => $dto->layout,
            'updated_at' => $dto->updatedAt,
        ];
    }
}
