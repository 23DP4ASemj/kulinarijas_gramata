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
        $topRecipes = \App\Models\Recipe::query()->limit(5)->get();

        return response()->json([
            'ok' => true,
            'step' => 'recipes-query',
            'count' => $topRecipes->count(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'ok' => false,
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
}
}
