<?php

namespace App\Http\Controllers;

use App\Services\USDANutritionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NutritionController extends Controller
{
    private $nutritionService;

    public function __construct(USDANutritionService $nutritionService)
    {
        $this->nutritionService = $nutritionService;
    }

    /**
     * Получить информацию о калорийности ингредиента
     * 
     * GET /api/nutrition/search
     */
    public function searchFood(Request $request)
    {
        if ($response = $this->ensureApiKeyConfigured()) {
            return $response;
        }

        $validated = $request->validate([
            'ingredient' => 'required|string|min:1|max:255',
        ]);

        $ingredient = $validated['ingredient'];
        $foodData = $this->nutritionService->searchFood($ingredient);

        if (!$foodData) {
            return response()->json([
                'success' => false,
                'message' => "Не удалось найти информацию о калорийности для '{$ingredient}'",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $foodData,
        ]);
    }

    /**
     * Рассчитать калории для одного ингредиента
     * 
     * POST /api/nutrition/calculate-ingredient
     */
    public function calculateIngredient(Request $request)
    {
        if ($response = $this->ensureApiKeyConfigured()) {
            return $response;
        }

        $validated = $request->validate([
            'ingredient' => 'required|string|min:1|max:255',
            'quantity' => 'required|numeric|min:0.1|max:10000',
        ]);

        $calories = $this->nutritionService->calculateCalories(
            $validated['ingredient'],
            $validated['quantity']
        );

        return response()->json([
            'success' => true,
            'data' => [
                'ingredient' => $validated['ingredient'],
                'quantity' => $validated['quantity'],
                'calories' => round($calories, 2),
            ],
        ]);
    }

    /**
     * Рассчитать калории для целого рецепта
     * 
     * POST /api/nutrition/calculate-recipe
     */
    public function calculateRecipe(Request $request)
    {
        if ($response = $this->ensureApiKeyConfigured()) {
            return $response;
        }

        $validated = $request->validate([
            'ingredients' => 'required|array|min:1',
            'ingredients.*.name' => 'required|string|min:1|max:255',
            'ingredients.*.quantity' => 'required|numeric|min:0.1|max:10000',
        ]);

        $result = $this->nutritionService->calculateRecipeCalories($validated['ingredients']);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    private function ensureApiKeyConfigured(): ?JsonResponse
    {
        if ($this->nutritionService->hasApiKey()) {
            return null;
        }

        return response()->json([
            'success' => false,
            'message' => 'USDA API key is not configured on the server.',
        ], 503);
    }
}
