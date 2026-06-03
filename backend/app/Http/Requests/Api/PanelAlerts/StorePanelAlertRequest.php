<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use App\Http\Requests\Concerns\ValidatesAlertAudience;
use Illuminate\Foundation\Http\FormRequest;

class StorePanelAlertRequest extends FormRequest
{
    use ValidatesAlertAudience;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareAlertAudienceDefaults();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'text' => ['required', 'string'],
            'severity' => ['required', 'string', 'in:critical,high,medium,low'],
            'action_label' => ['nullable', 'string', 'max:255'],
            'action_url' => ['nullable', 'url', 'max:2048'],
            'visible_from' => ['required', 'date'],
            'visible_until' => ['nullable', 'date', 'after:visible_from'],
        ], $this->alertAudienceRules());
    }
}
