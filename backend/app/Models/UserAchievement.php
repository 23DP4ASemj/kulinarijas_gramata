<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAchievement extends Model
{
    protected $fillable = [
        'user_id',
        'achievement_key',
        'current_tier',
        'notified_tier',
        'last_unlocked_at',
        'last_notified_at',
    ];

    protected $casts = [
        'last_unlocked_at' => 'datetime',
        'last_notified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
