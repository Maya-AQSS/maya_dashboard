<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Booking;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use Illuminate\Foundation\Http\FormRequest;

class ListBookingsRequest extends FormRequest
{
    use AuthorizesByPermission;

    /**
     * D27: las reservas (widget y calendario) solo se ven con `dashboard.bookings`, que nadie tiene
     * hasta que maya_booking tenga una versión publicada.
     */
    public function authorize(): bool
    {
        return $this->userHasPermission('dashboard.bookings');
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
