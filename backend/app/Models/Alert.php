<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'context'         => 'array',
            'created_at'      => 'datetime',
            'acknowledged_at' => 'datetime',
            'resolved_at'     => 'datetime',
        ];
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class, 'rule_slug', 'slug');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('resolved_at');
    }
}
