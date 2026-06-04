<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\NotificationObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([NotificationObserver::class])]
class Notification extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'message_id',
        'app',
        'type',
        'recipient_id',
        'title',
        'body',
        'title_key',
        'body_key',
        'params',
        'severity',
        'url',
        'target_app',
        'scope',
        'channels',
        'metadata',
        'read_at',
        'acknowledged_at',
        'acknowledged_by',
        'resolved_at',
        'resolved_by',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'metadata' => 'array',
            'params' => 'array',
            'created_at' => 'datetime',
            'read_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function scopeForRecipient(Builder $query, string $recipientId): Builder
    {
        return $query->where('recipient_id', $recipientId);
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * Severity in [critical, high] is considered critical for widget/alert surfacing.
     */
    public function scopeCritical(Builder $query): Builder
    {
        return $query->whereIn('severity', ['critical', 'high']);
    }

    public function isCritical(): bool
    {
        return in_array($this->severity, ['critical', 'high'], true);
    }
}
