<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePanelAlertRuleRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'event_type' => ['sometimes', 'string', 'max:255'],
            'conditions' => ['sometimes', 'nullable', 'array'],
            'conditions.*.key' => ['required_with:conditions.*', 'string'],
            'conditions.*.operator' => ['required_with:conditions.*', 'string'],
            'conditions.*.value' => ['present'],
            'alert_text' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'string', 'in:critical,high,medium,low'],
            'action_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'action_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'visible_duration_hours' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'max_frequency_minutes' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
