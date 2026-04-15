<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Rating;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $topLimit = (int) $request->query('top_limit', 5);
        $topLimit = max(1, min(10, $topLimit));

        $topRecipes = Recipe::query()
            ->with(['category:id,name', 'author:id,name'])
            ->withAvg('ratings', 'value')
            ->withCount('ratings')
            ->withCount('favorites')
            ->latest()
            ->limit($topLimit)
            ->get();

        $topAuthors = User::query()
            ->leftJoin('recipes', 'users.id', '=', 'recipes.user_id')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(recipes.id) as recipes_count')
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('recipes_count')
            ->limit($topLimit)
            ->get()
            ->map(function ($author) {
                return [
                    'id' => (int) $author->id,
                    'name' => $author->name,
                    'recipes_count' => (int) $author->recipes_count,
                    'avg_rating' => 0,
                    'followers_count' => 0,
                    'is_following' => false,
                    'is_me' => false,
                ];
            })
            ->values();

        return response()->json([
            'top_recipes' => RecipeListResource::collection($topRecipes)->resolve(),
            'top_authors' => $topAuthors,
            'recommended_authors' => $topAuthors->take(6)->values(),
            'recipes' => [],
            'stats' => [
                'recipes_count' => Recipe::count(),
                'authors_count' => User::count(),
                'ratings_count' => Rating::count(),
            ],
        ]);
    }
}