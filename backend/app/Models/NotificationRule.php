<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsAudience;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A configurable instance of a scheduled notification rule (level B). The
 * owning service reads its active rules via the v_notification_rules FDW view
 * and runs the evaluator identified by `evaluator_key`.
 */
class NotificationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluator_key',
        'source_app',
        'name',
        'description',
        'params',
        'schedule_cron',
        'audience',
        'severity',
        'enabled',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'params' => 'array',
            'audience' => AsAudience::class,
            'enabled' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function scopeForApp(Builder $query, string $app): Builder
    {
        return $query->where('source_app', $app);
    }

    public function scopeEnabled(Builder $query): Builder
    {
        return $query->where('enabled', true);
    }
}
