<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\Notifications;

use App\Http\Requests\Concerns\AuthorizesByPermission;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationDefinitionRequest extends FormRequest
{
    use AuthorizesByPermission;

    public function authorize(): bool
    {
        return $this->userHasPermission('dashboard.panel_alerts.update');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
        ];
    }
}
