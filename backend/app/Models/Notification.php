<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
