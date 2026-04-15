<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Recipe;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index(Request $request)
{
    return response()->json([
        'top_recipes' => [],
        'top_authors' => [],
        'recommended_authors' => [],
        'recipes' => [],
        'stats' => [
            'recipes_count' => 0,
            'authors_count' => 0,
            'ratings_count' => 0,
        ],
    ]);
}
}
