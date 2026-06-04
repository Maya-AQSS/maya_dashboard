<?php

declare(strict_types=1);

namespace App\Casts;

use App\DTOs\AlertAudienceDto;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Casts the JSONB `audience` column to/from an AlertAudienceDto value object.
 *
 * @implements CastsAttributes<AlertAudienceDto, AlertAudienceDto|array<string, mixed>>
 */
final class AsAudience implements CastsAttributes
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?AlertAudienceDto
    {
        if ($value === null) {
            return null;
        }

        $data = is_array($value) ? $value : json_decode((string) $value, true);

        return AlertAudienceDto::fromArray(is_array($data) ? $data : []);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, string|null>
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): array
    {
        if ($value === null) {
            return [$key => null];
        }

        $dto = $value instanceof AlertAudienceDto
            ? $value
            : AlertAudienceDto::fromArray((array) $value);

        return [$key => json_encode($dto->toPersistenceArray())];
    }
}
