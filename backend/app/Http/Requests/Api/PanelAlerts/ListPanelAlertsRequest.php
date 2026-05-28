<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use Illuminate\Foundation\Http\FormRequest;

class ListPanelAlertsRequest extends FormRequest
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
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'severity' => ['nullable', 'string', 'in:critical,high,medium,low'],
            'search' => ['nullable', 'string', 'max:255'],
            'include_expired' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', 'string', 'in:visible_from,created_at,severity'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
