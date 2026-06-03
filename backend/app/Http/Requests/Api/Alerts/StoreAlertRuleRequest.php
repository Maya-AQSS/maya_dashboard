<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Alerts;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use App\Http\Requests\Concerns\ValidatesAlertAudience;
use App\Rules\SafeAlertQuery;
use Illuminate\Foundation\Http\FormRequest;

class StoreAlertRuleRequest extends FormRequest
{
    use AuthorizesByPermission;
    use ValidatesAlertAudience;

    public function authorize(): bool
    {
        return $this->userHasPermission('alerts.manage');
    }

    protected function prepareForValidation(): void
    {
        $this->prepareAlertAudienceDefaults();
    }

    public function rules(): array
    {
        return array_merge([
            'slug' => ['required', 'string', 'max:128', 'unique:alert_rules,slug', 'regex:/^[a-z0-9][a-z0-9\-]*$/'],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'query_sql' => ['required', 'string', new SafeAlertQuery],
            'severity' => ['required', 'in:critical,high,medium,low'],
            'schedule_cron' => ['string', 'max:64'],
            'enabled' => ['boolean'],
            'context_template' => ['array'],
            'context_template.sample_columns' => ['sometimes', 'array'],
            'context_template.sample_columns.*' => ['string', 'max:128'],
        ], $this->alertAudienceRules());
    }
}
