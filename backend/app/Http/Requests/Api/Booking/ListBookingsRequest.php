<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Booking;

use Illuminate\Foundation\Http\FormRequest;

class ListBookingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
            'view' => ['nullable', 'string', 'in:month,week,day,agenda'],
        ];
    }
}
