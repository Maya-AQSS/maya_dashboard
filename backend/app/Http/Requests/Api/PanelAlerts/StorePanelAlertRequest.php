<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\PanelAlerts;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use App\Http\Requests\Concerns\ValidatesAlertAudience;
use App\Http\Requests\Concerns\ValidatesPanelAlertTranslations;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StorePanelAlertRequest extends FormRequest
{
    use AuthorizesByPermission;
    use ValidatesAlertAudience;
    use ValidatesPanelAlertTranslations;

    public function authorize(): bool
    {
        return $this->userHasPermission('dashboard.panel_alerts.create');
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
            // `text` legacy: requerido solo si no se envía el mapa translations.text.
            'text' => ['required_without:translations.text', 'string'],
            'severity' => ['required', 'string', 'in:critical,high,medium,low,info'],
            'action_label' => ['nullable', 'string', 'max:255'],
            'action_url' => ['nullable', 'url', 'max:2048'],
            'visible_from' => ['required', 'date'],
            'visible_until' => ['nullable', 'date', 'after:visible_from'],
            // Recurrencia opcional (decisión 1: alertas manuales con cron).
            'schedule_cron' => ['nullable', 'string', 'max:64'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:525600'],
        ], $this->translationRules(creating: true), $this->alertAudienceRules());
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(fn (Validator $v) => $this->assertDefaultLocaleTextPresent($v));
    }
}
