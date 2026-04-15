<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Recipe;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $viewerId = auth('sanctum')->id();
        $weight = 0.1;
        $topLimit = (int) $request->query('top_limit', 5);
        $topLimit = max(1, min(10, $topLimit));

        $topRecipes = Recipe::listQuery($viewerId)
            ->orderByRaw('(COALESCE(ratings_avg_value, 0) + (ratings_count * ?)) desc', [$weight])
            ->limit($topLimit)
            ->get();

        return response()->json([
            'top_recipes' => RecipeListResource::collection($topRecipes)->resolve(),
            'top_authors' => [],
            'recommended_authors' => [],
            'recipes' => [],
            'stats' => [
                'recipes_count' => Recipe::count(),
                'authors_count' => 0,
                'ratings_count' => 0,
            ],
        ]);
    }
}