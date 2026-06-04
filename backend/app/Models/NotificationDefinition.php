<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsAudience;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Catalog of every system notification / scheduled-rule type.
 *
 * The single source of truth for whether a type is enabled (the on/off toggle,
 * enforced at ingestion) and how it is presented (severity, i18n keys, url).
 */
class NotificationDefinition extends Model
{
    use HasFactory;

    public const ENABLED_KEYS_CACHE = 'notification_definitions.enabled_keys';

    protected $fillable = [
        'key',
        'source_app',
        'category',
        'label',
        'description',
        'enabled',
        'default_severity',
        'title_key',
        'body_key',
        'url_template',
        'target_app',
        'schedule_cron',
        'last_evaluated_at',
        'audience',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'audience' => AsAudience::class,
            'last_evaluated_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        $flush = static fn () => Cache::forget(self::ENABLED_KEYS_CACHE);
        static::saved($flush);
        static::deleted($flush);
    }

    public function scopeEnabled(Builder $query): Builder
    {
        return $query->where('enabled', true);
    }

    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('category', 'scheduled');
    }
}
