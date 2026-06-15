<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use App\Http\Requests\Concerns\ValidatesAlertAudience;
use App\Http\Requests\Concerns\ValidatesPanelAlertTranslations;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePanelAlertRequest extends FormRequest
{
    use AuthorizesByPermission;
    use ValidatesAlertAudience;
    use ValidatesPanelAlertTranslations;

    public function authorize(): bool
    {
        return $this->userHasPermission('dashboard.panel_alerts.update');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'text' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'string', 'in:critical,high,medium,low,info'],
            'action_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'action_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'visible_from' => ['sometimes', 'date', 'after_or_equal:now'],
            'visible_until' => ['sometimes', 'nullable', 'date', 'after:visible_from'],
            'schedule_cron' => ['sometimes', 'nullable', 'string', 'max:64'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:525600'],
        ], $this->translationRules(creating: false), $this->alertAudienceRules());
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(fn (Validator $v) => $this->assertDefaultLocaleTextPresent($v));
    }
}
