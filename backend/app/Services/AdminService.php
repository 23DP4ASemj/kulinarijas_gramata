<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Comment;
use App\Models\Ingredient;
use App\Models\Rating;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminService
{
    public function analytics(): array
    {
        $favoritesCount = DB::table('recipe_favorites')->count();

        return [
            'users_count' => User::count(),
            'recipes_count' => Recipe::count(),
            'comments_count' => Comment::count(),
            'ratings_count' => Rating::count(),
            'favorites_count' => (int) $favoritesCount,
            'collections_count' => Collection::count(),
            'ingredients_count' => Ingredient::count(),
        ];
    }
}
