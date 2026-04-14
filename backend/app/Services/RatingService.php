<?php

namespace App\Services;

use App\Models\Rating;
use App\Models\Recipe;
use App\Models\User;

class RatingService
{
    public function upsert(User $user, Recipe $recipe, int $value): Rating
    {
        return Rating::updateOrCreate(
            ['user_id' => $user->id, 'recipe_id' => $recipe->id],
            ['value' => $value]
        );
    }

    public function delete(User $user, Recipe $recipe): void
    {
        Rating::where('user_id', $user->id)
            ->where('recipe_id', $recipe->id)
            ->delete();
    }

    public function statsForRecipe(Recipe $recipe): array
    {
        $ratingAgg = Rating::where('recipe_id', $recipe->id)
            ->selectRaw('COALESCE(AVG(value),0) as avg_rating, COUNT(*) as ratings_count')
            ->first();

        return [
            'avg_rating' => (float) ($ratingAgg->avg_rating ?? 0),
            'ratings_count' => (int) ($ratingAgg->ratings_count ?? 0),
        ];
    }
}
