<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PanelAlertRule extends Model
{
    protected $fillable = [
        'name',
        'description',
        'event_type',
        'conditions',
        'alert_text',
        'severity',
        'action_label',
        'action_url',
        'visible_duration_hours',
        'max_frequency_minutes',
        'is_active',
        'last_triggered_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'conditions' => 'array',
            'is_active' => 'boolean',
            'last_triggered_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function panelAlerts(): HasMany
    {
        return $this->hasMany(PanelAlert::class, 'rule_id');
    }
}
