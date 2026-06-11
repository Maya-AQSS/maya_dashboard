<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class ListNotificationDefinitionsRequest extends FormRequest
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
            'category' => ['nullable', 'string', 'in:event,scheduled'],
            'source_app' => ['nullable', 'string', 'max:64'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:255'],
            'sort_by' => ['nullable', 'string', 'in:label,source_app,default_severity,last_evaluated_at'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
