<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use Illuminate\Foundation\Http\FormRequest;

class StorePanelAlertRuleRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_type' => ['required', 'string', 'max:255'],
            'conditions' => ['nullable', 'array'],
            'conditions.*.key' => ['required_with:conditions.*', 'string'],
            'conditions.*.operator' => ['required_with:conditions.*', 'string'],
            'conditions.*.value' => ['present'],
            'alert_text' => ['required', 'string'],
            'severity' => ['required', 'string', 'in:critical,high,medium,low'],
            'action_label' => ['nullable', 'string', 'max:255'],
            'action_url' => ['nullable', 'url', 'max:2048'],
            'visible_duration_hours' => ['nullable', 'integer', 'min:1'],
            'max_frequency_minutes' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }
}
