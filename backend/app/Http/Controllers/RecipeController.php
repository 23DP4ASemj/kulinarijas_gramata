<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Http\Requests\Recipe\StoreRecipeRequest;
use App\Http\Requests\Recipe\UpdateRecipeRequest;
use App\Http\Resources\RecipeListResource;
use App\Http\Resources\RecipeResource;
use App\Services\RecipeService;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index(Request $request, RecipeService $recipeService)
    {
        $viewerId = auth('sanctum')->id();
        $paginator = $recipeService->paginate($request, $viewerId);

        return RecipeListResource::collection($paginator);
    }

    public function store(StoreRecipeRequest $request, RecipeService $recipeService)
    {
        $recipe = $recipeService->create($request->user(), $request->validated());

        return response()->json([
            'recipe' => new RecipeResource($recipe),
        ], 201);
    }

    public function show(Request $request, int $id, RecipeService $recipeService)
    {
        $viewerId = auth('sanctum')->id();
        $recipe = $recipeService->getDetail($id, $viewerId);

        return response()->json([
            'recipe' => new RecipeResource($recipe),
        ]);
    }

    public function similar(Request $request, int $recipe, RecipeService $recipeService)
    {
        $viewerId = auth('sanctum')->id();
        $limit = (int) $request->query('limit', 6);
        $items = $recipeService->getSimilar($recipe, $viewerId, $limit);

        return RecipeListResource::collection($items);
    }

    public function update(UpdateRecipeRequest $request, Recipe $recipe, RecipeService $recipeService)
    {
        $this->authorize('update', $recipe);

        $recipe = $recipeService->update($recipe, $request->validated());

        return response()->json([
            'recipe' => new RecipeResource($recipe),
        ]);
    }

    public function destroy(Request $request, Recipe $recipe, RecipeService $recipeService)
    {
        $this->authorize('delete', $recipe);

        $recipeService->delete($recipe);

        return response()->json(['message' => 'Recipe deleted.']);
    }
}
