<?php

namespace App\Http\Resources;

use App\DTOs\UserContextDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource que prepara los datos del usuario para ser utilizados en la aplicación.
 * 
 * @mixin UserContextDto
 */
class UserContextResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var UserContextDto $context */
        $context = $this->resource;

        return $context->toArray();
    }
}
