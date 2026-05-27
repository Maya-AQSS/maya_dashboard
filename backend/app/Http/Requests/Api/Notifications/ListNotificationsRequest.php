<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class ListNotificationsRequest extends FormRequest
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
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:100'],
            'type'       => ['nullable', 'string', 'max:64'],
            'app'        => ['nullable', 'string', 'max:64'],
            'unread_only' => ['nullable', 'boolean'],
            'search'     => ['nullable', 'string', 'max:200'],
            'date_from'  => ['nullable', 'date'],
            'date_to'    => ['nullable', 'date'],
            'sort_by'    => ['nullable', 'string', 'in:created_at,read_at'],
            'sort_dir'   => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
