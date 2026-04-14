<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BlogPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'excerpt',
        'content',
        'image_url',
        'image_path',
        'views_count',
        'comments_count',
        'user_id',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getImageUrlAttribute(?string $value)
    {
        if ($value) {
            return $value;
        }

        if ($this->image_path) {
            return url(Storage::disk('public')->url($this->image_path));
        }

        return null;
    }
}
