<?php
declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class FavoriteStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_id' => ['required', 'integer', 'exists:applications,id'],
        ];
    }
}
