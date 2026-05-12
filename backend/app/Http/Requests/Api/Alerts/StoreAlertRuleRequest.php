<?php

namespace App\Http\Requests\Api\Alerts;

use Illuminate\Foundation\Http\FormRequest;

class StoreAlertRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug'             => ['required', 'string', 'max:128', 'unique:alert_rules,slug', 'regex:/^[a-z0-9][a-z0-9\-]*$/'],
            'name'             => ['required', 'string', 'max:200'],
            'description'      => ['nullable', 'string'],
            'query_sql'        => ['required', 'string'],
            'severity'         => ['required', 'in:critical,high,medium,low'],
            'schedule_cron'    => ['string', 'max:64'],
            'enabled'          => ['boolean'],
            'context_template' => ['array'],
        ];
    }
}
