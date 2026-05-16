<?php
declare(strict_types=1);

namespace App\Models;

use App\Observers\UserDashboardLayoutObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([UserDashboardLayoutObserver::class])]
class UserDashboardLayout extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'layout', 'updated_at'];

    protected $casts = [
        'layout' => 'array',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
