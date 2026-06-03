<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use App\Http\Requests\Concerns\ValidatesAlertAudience;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePanelAlertRequest extends FormRequest
{
    use ValidatesAlertAudience;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'text' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'string', 'in:critical,high,medium,low'],
            'action_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'action_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'visible_from' => ['sometimes', 'date'],
            'visible_until' => ['sometimes', 'nullable', 'date', 'after:visible_from'],
        ], $this->alertAudienceRules());
    }
}
