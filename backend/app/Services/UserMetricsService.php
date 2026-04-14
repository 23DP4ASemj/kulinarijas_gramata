<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserMetricsService
{
    public function getForUser(User $user): array
    {
        $userId = (int) $user->id;
        $averageRating = DB::table('ratings')
            ->join('recipes', 'ratings.recipe_id', '=', 'recipes.id')
            ->where('recipes.user_id', $userId)
            ->avg('ratings.value');

        return [
            'recipes_count' => (int) $user->recipes()->count(),
            'total_favorites_received' => (int) DB::table('recipe_favorites')
                ->join('recipes', 'recipe_favorites.recipe_id', '=', 'recipes.id')
                ->where('recipes.user_id', $userId)
                ->count(),
            'followers_count' => (int) $user->followers()->count(),
            'comments_count' => (int) $user->comments()->count(),
            'ratings_given_count' => (int) $user->ratings()->count(),
            'collections_count' => (int) $user->collections()->count(),
            'average_rating' => round((float) ($averageRating ?? 0), 1),
        ];
    }
}
