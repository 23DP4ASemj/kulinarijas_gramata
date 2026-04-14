<?php

namespace App\Services;

use App\Models\Recipe;
use App\Models\User;

class FavoriteService
{
    public function favorite(User $user, Recipe $recipe): array
    {
        $recipe->favorites()->syncWithoutDetaching([$user->id]);

        return [
            'is_favorited_by_me' => true,
            'favorites_count' => (int) $recipe->favorites()->count(),
        ];
    }

    public function unfavorite(User $user, Recipe $recipe): array
    {
        $recipe->favorites()->detach($user->id);

        return [
            'is_favorited_by_me' => false,
            'favorites_count' => (int) $recipe->favorites()->count(),
        ];
    }
}
