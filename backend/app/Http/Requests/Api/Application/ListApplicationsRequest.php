<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Application;

use Illuminate\Foundation\Http\FormRequest;

class ListApplicationsRequest extends FormRequest
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
            'page' => ['nullable', 'integer', 'min:1'],
            // Sin tope de validación: el controlador clampa a 200 (min(...,200)).
            // Con 'max:200' un per_page mayor daba 422 y el clamp quedaba muerto.
            'per_page' => ['nullable', 'integer', 'min:1'],
            'search' => ['nullable', 'string', 'max:255'],
            'favorite' => ['nullable', 'string', 'in:yes,no'],
            'sort_by' => ['nullable', 'string', 'in:name,description,updated_at'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
