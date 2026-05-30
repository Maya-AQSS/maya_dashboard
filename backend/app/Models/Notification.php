<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\NotificationObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([NotificationObserver::class])]
class Notification extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'message_id',
        'app',
        'type',
        'recipient_id',
        'title',
        'body',
        'channels',
        'metadata',
        'read_at',
        'is_critical',
        'scope',
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
            'created_at' => 'datetime',
            'read_at' => 'datetime',
            'is_critical' => 'boolean',
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function scopeForRecipient(\Illuminate\Database\Eloquent\Builder $query, string $recipientId): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('recipient_id', $recipientId);
    }

    public function scopeUnread(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereNull('read_at');
    }
}
