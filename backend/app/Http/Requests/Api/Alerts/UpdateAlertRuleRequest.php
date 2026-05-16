<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Alerts;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use App\Rules\SafeAlertQuery;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAlertRuleRequest extends FormRequest
{
    use AuthorizesByPermission;

    public function authorize(): bool
    {
        return $this->userHasPermission('alerts.manage');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string'],
            'query_sql' => ['sometimes', 'string', new SafeAlertQuery],
            'severity' => ['sometimes', 'in:critical,high,medium,low'],
            'schedule_cron' => ['sometimes', 'string', 'max:64'],
            'enabled' => ['sometimes', 'boolean'],
            'context_template' => ['sometimes', 'array'],
            'context_template.sample_columns' => ['sometimes', 'array'],
            'context_template.sample_columns.*' => ['string', 'max:128'],
        ];
    }
}
