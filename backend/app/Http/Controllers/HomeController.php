<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Recipe;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
{
    $topRecipes = Recipe::query()->limit(5)->get();

    return response()->json([
        'top_recipes' => $topRecipes,
    ]);
}
}