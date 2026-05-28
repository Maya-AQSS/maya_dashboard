<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use Illuminate\Foundation\Http\FormRequest;

class StorePanelAlertRequest extends FormRequest
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
            'text' => ['required', 'string'],
            'severity' => ['required', 'string', 'in:critical,high,medium,low'],
            'action_label' => ['nullable', 'string', 'max:255'],
            'action_url' => ['nullable', 'url', 'max:2048'],
            'visible_from' => ['required', 'date'],
            'visible_until' => ['nullable', 'date', 'after:visible_from'],
        ];
    }
}
