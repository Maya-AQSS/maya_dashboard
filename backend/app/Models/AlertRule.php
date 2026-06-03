<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\AlertRuleObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

#[ObservedBy([AlertRuleObserver::class])]
class AlertRule extends Model
{
    use HasFactory;
    public const VALID_SLUGS_CACHE_KEY = 'alert_rules.valid_slugs';

    protected $fillable = [
        'slug', 'name', 'description', 'query_sql', 'severity',
        'schedule_cron', 'enabled', 'context_template', 'last_evaluated_at',
        'created_by_id',
        'notify_all',
        'audience_kind',
        'academic_level',
        'audience_study_type_id',
        'audience_study_id',
        'audience_module_id',
        'audience_team_id',
    ];

    protected static function booted(): void
    {
        $invalidate = fn () => Cache::forget(self::VALID_SLUGS_CACHE_KEY);
        static::created($invalidate);
        static::updated($invalidate);
        static::deleted($invalidate);
    }

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'notify_all' => 'boolean',
            'context_template' => 'array',
            'last_evaluated_at' => 'datetime',
        ];
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'rule_slug', 'slug');
    }
}
