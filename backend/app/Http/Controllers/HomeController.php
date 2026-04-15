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
    try {
        $topRecipes = \App\Models\Recipe::query()
            ->with(['category:id,name', 'author:id,name'])
            ->withAvg('ratings', 'value')
            ->withCount('ratings')
            ->limit(5)
            ->get();

        $topAuthors = \App\Models\User::query()
            ->select('id', 'name')
            ->limit(5)
            ->get();

        return response()->json([
            'top_recipes' => $topRecipes,
            'top_authors' => $topAuthors,
            'recommended_authors' => $topAuthors,
            'recipes' => [],
            'stats' => [
                'recipes_count' => \App\Models\Recipe::count(),
                'authors_count' => \App\Models\User::count(),
                'ratings_count' => \App\Models\Rating::count(),
            ],
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => true,
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
}
}