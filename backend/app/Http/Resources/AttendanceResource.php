<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DTOs\AttendanceDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property AttendanceDto $resource
 */
class AttendanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var AttendanceDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'user_id' => $dto->userId,
            'check_in' => $dto->checkIn,
            'check_out' => $dto->checkOut,
            'source' => $dto->source,
        ];
    }
}
