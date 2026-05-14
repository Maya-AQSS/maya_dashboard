<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DataTransferObjects\UserDashboardLayoutDto;
use App\Models\UserDashboardLayout;
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
        $dto = $this->resource instanceof UserDashboardLayout
            ? UserDashboardLayoutDto::fromModel($this->resource)
            : $this->resource;

        return [
            'layout'     => $dto->layout,
            'updated_at' => $dto->updatedAt,
        ];
    }
}
