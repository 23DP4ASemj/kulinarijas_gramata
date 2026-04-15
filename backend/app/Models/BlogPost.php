<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        return MediaUrl::publicDisk($value, $this->image_path);
    }
}
