<?php

namespace App\Http\Controllers;

use App\Http\Requests\Rating\StoreRatingRequest;
use App\Models\Recipe;
use App\Services\RatingService;

class RatingController extends Controller
{
    public function store(StoreRatingRequest $request, Recipe $recipe, RatingService $ratingService)
    {
        $ratingService->upsert($request->user(), $recipe, (int) $request->validated()['value']);
        $stats = $ratingService->statsForRecipe($recipe);

        return response()->json($stats);
    }

    public function destroy(Recipe $recipe, RatingService $ratingService)
    {
        $ratingService->delete(request()->user(), $recipe);
        $stats = $ratingService->statsForRecipe($recipe);

        return response()->json($stats);
    }
}
