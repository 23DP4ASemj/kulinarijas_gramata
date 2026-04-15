<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'user_id',
        'prep_time_minutes',
        'difficulty',
        'quantity',
        'image_path',
        'image_url',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class);
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class)
            ->withPivot(['amount', 'unit'])
            ->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(User::class, 'recipe_favorites')->withTimestamps();
    }

    public function steps()
    {
        return $this->hasMany(RecipeStep::class)->orderBy('step_number');
    }

    public function getImageUrlAttribute(?string $value): ?string
    {
        return MediaUrl::publicDisk($value, $this->image_path);
    }

    public static function listQuery(?int $viewerId = null)
    {
        $query = static::query()
            ->with(['category:id,name', 'author:id,name'])
            ->withAvg('ratings', 'value')
            ->withCount('ratings')
            ->withCount('favorites');

        if ($viewerId) {
            $query->withCount([
                'favorites as is_favorited_by_me' => function ($inner) use ($viewerId) {
                    $inner->where('user_id', $viewerId);
                },
            ]);
        }

        return $query;
    }

    public function toListArray(): array
    {
        return [
            'id' => (int) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category ? [
                'id' => (int) $this->category->id,
                'name' => $this->category->name,
            ] : null,
            'author' => $this->author ? [
                'id' => (int) $this->author->id,
                'name' => $this->author->name,
            ] : null,
            'avg_rating' => (float) ($this->ratings_avg_value ?? 0),
            'ratings_count' => (int) ($this->ratings_count ?? 0),
            'prep_time_minutes' => $this->prep_time_minutes !== null ? (int) $this->prep_time_minutes : null,
            'difficulty' => $this->difficulty,
            'quantity' => $this->quantity,
            'image_url' => $this->image_url,
            'favorites_count' => (int) ($this->favorites_count ?? 0),
            'is_favorited_by_me' => (bool) ($this->is_favorited_by_me ?? false),
        ];
    }
}
