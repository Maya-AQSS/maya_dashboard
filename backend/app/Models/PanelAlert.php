<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\PanelAlertObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([PanelAlertObserver::class])]
class PanelAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'severity',
        'action_label',
        'action_url',
        'visible_from',
        'visible_until',
        'source',
        'rule_id',
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
            'notify_all' => 'boolean',
            'visible_from' => 'datetime',
            'visible_until' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(PanelAlertRule::class, 'rule_id');
    }

    /**
     * Scope to alerts currently visible: visible_from <= now AND (visible_until IS NULL OR visible_until >= now).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('visible_from', '<=', now())
            ->where(function (Builder $q) {
                $q->whereNull('visible_until')
                    ->orWhere('visible_until', '>=', now());
            });
    }
}
