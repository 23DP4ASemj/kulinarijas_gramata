<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, MustVerifyEmailTrait;

    public const ROLE_GUEST = 'guest';
    public const ROLE_USER = 'user';
    public const ROLE_AUTHOR = 'author';
    public const ROLE_ADMIN = 'admin';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_path',
        'avatar_url',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function achievementStates()
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function recipeRatings()
    {
        return $this->hasManyThrough(Rating::class, Recipe::class, 'user_id', 'recipe_id');
    }

    public function favoriteRecipes()
    {
        return $this->belongsToMany(Recipe::class, 'recipe_favorites')->withTimestamps();
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'following_id', 'follower_id')->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'following_id')->withTimestamps();
    }

    public function scopeWithEffectiveRoleFlags($query)
    {
        return $query->withCount([
            'recipes as published_recipes_count',
            'blogPosts as published_blog_posts_count',
        ]);
    }

    public function getAssignedRole(): string
    {
        return (string) ($this->getRawOriginal('role') ?: self::ROLE_USER);
    }

    public function hasPublishedContent(): bool
    {
        $hasRecipes = array_key_exists('published_recipes_count', $this->attributes)
            ? (int) $this->attributes['published_recipes_count'] > 0
            : ($this->relationLoaded('recipes') ? $this->recipes->isNotEmpty() : $this->recipes()->exists());

        $hasBlogPosts = array_key_exists('published_blog_posts_count', $this->attributes)
            ? (int) $this->attributes['published_blog_posts_count'] > 0
            : ($this->relationLoaded('blogPosts') ? $this->blogPosts->isNotEmpty() : $this->blogPosts()->exists());

        return $hasRecipes || $hasBlogPosts;
    }

    public function getEffectiveRoleAttribute(): string
    {
        $assignedRole = $this->getAssignedRole();

        if ($assignedRole === self::ROLE_ADMIN) {
            return self::ROLE_ADMIN;
        }

        if ($assignedRole === self::ROLE_AUTHOR) {
            return self::ROLE_AUTHOR;
        }

        return $this->hasPublishedContent() ? self::ROLE_AUTHOR : self::ROLE_USER;
    }

    public function hasRole(string $role): bool
    {
        return $this->effective_role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->effective_role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->effective_role === self::ROLE_ADMIN;
    }

    public function isAuthor(): bool
    {
        return $this->effective_role === self::ROLE_AUTHOR;
    }

    public function isUser(): bool
    {
        return $this->effective_role === self::ROLE_USER;
    }

    public function getAvatarUrlAttribute(?string $value)
    {
        return MediaUrl::publicDisk($value, $this->avatar_path);
    }
}
