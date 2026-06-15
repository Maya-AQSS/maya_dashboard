<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Me;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use Illuminate\Foundation\Http\FormRequest;

// ODOO_BRIDGE — Eliminar cuando la integración con Odoo esté completa.
final class UpdateMeEmployeeRequest extends FormRequest
{
    use AuthorizesByPermission;

    public function authorize(): bool
    {
        return $this->userHasPermission('profile.update');
    }

    protected function prepareForValidation(): void
    {
        $fields = ['personal_email', 'iban', 'car_registration_number_1', 'car_registration_number_2', 'car_registration_number_3'];

        $this->merge(array_map(
            fn ($v) => ($v === '' || $v === null) ? null : $v,
            $this->only($fields),
        ));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'personal_email'           => ['nullable', 'email', 'max:254'],
            'iban'                     => ['nullable', 'string', 'max:34'],
            'car_registration_number_1' => ['nullable', 'string', 'max:20'],
            'car_registration_number_2' => ['nullable', 'string', 'max:20'],
            'car_registration_number_3' => ['nullable', 'string', 'max:20'],
        ];
    }
}
