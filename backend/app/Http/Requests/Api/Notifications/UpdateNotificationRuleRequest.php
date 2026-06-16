<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Notifications;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use App\Http\Requests\Concerns\ValidatesAlertAudience;
use App\Http\Requests\Concerns\ValidatesNotificationConditions;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRuleRequest extends FormRequest
{
    use AuthorizesByPermission;
    use ValidatesAlertAudience;
    use ValidatesNotificationConditions;

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
            'evaluator_key' => ['sometimes', 'string', 'max:128'],
            'name' => ['sometimes', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string'],
            'params' => ['sometimes', 'nullable', 'array'],
            'schedule_cron' => ['sometimes', 'string', 'max:64'],
            'severity' => ['sometimes', 'nullable', 'string', 'in:critical,high,medium,low,info'],
            'enabled' => ['sometimes', 'boolean'],
        ], $this->alertAudienceRules(), $this->conditionsRules());
    }
}
