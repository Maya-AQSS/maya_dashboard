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

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'channels'   => 'array',
            'metadata'   => 'array',
            'created_at' => 'datetime',
            'read_at'    => 'datetime',
        ];
    }

    public function scopeForRecipient($query, string $recipientId)
    {
        return $query->where('recipient_id', $recipientId);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
