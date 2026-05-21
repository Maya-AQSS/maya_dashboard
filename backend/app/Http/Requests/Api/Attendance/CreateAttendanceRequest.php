<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class CreateAttendanceRequest extends FormRequest
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
            'source' => ['nullable', 'string', 'max:64'],
        ];
    }
}
