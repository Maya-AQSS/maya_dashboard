<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\PanelAlertRuleObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([PanelAlertRuleObserver::class])]
class PanelAlertRule extends Model
{
    use HasFactory;

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
        'notify_all',
        'audience_kind',
        'academic_level',
        'audience_study_type_id',
        'audience_study_id',
        'audience_module_id',
        'audience_team_id',
    ];

    protected function casts(): array
    {
        return [
            'conditions' => 'array',
            'is_active' => 'boolean',
            'notify_all' => 'boolean',
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
