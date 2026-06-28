<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\BookingDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property BookingDto $resource
 */
class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var BookingDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'user_id' => $dto->userId,
            'title' => $dto->title,
            'resource_id' => $dto->resourceId,
            'resource_name' => $dto->resourceName,
            'start_at' => $dto->startAt,
            'end_at' => $dto->endAt,
            'all_day' => $dto->allDay,
            'status' => $dto->status,
        ];
    }
}
