<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Notifications;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use App\Http\Requests\Concerns\ValidatesAlertAudience;
use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRuleRequest extends FormRequest
{
    use AuthorizesByPermission;
    use ValidatesAlertAudience;

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
            'evaluator_key' => ['required', 'string', 'max:128'],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'params' => ['nullable', 'array'],
            'schedule_cron' => ['required', 'string', 'max:64'],
            'severity' => ['nullable', 'string', 'in:critical,high,medium,low,info'],
            'enabled' => ['nullable', 'boolean'],
        ], $this->alertAudienceRules());
    }
}
