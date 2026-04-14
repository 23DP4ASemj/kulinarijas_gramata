<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Services\FavoriteService;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function store(Request $request, Recipe $recipe, FavoriteService $favoriteService)
    {
        $payload = $favoriteService->favorite($request->user(), $recipe);

        return response()->json($payload);
    }

    public function destroy(Request $request, Recipe $recipe, FavoriteService $favoriteService)
    {
        $payload = $favoriteService->unfavorite($request->user(), $recipe);

        return response()->json($payload);
    }
}
