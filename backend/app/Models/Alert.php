<?php

namespace App\Models;

use App\Observers\AlertObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([AlertObserver::class])]
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
