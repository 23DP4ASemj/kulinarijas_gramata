<?php

namespace App\Providers;

use App\Models\Collection;
use App\Models\Comment;
use App\Models\Recipe;
use App\Models\Rating;
use App\Policies\CollectionPolicy;
use App\Policies\CommentPolicy;
use App\Policies\RecipePolicy;
use App\Policies\RatingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Recipe::class => RecipePolicy::class,
        Collection::class => CollectionPolicy::class,
        Comment::class => CommentPolicy::class,
        Rating::class => RatingPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
