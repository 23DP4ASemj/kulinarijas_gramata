<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class USDANutritionService
{
    private $apiKey;
    private $baseUrl = 'https://api.nal.usda.gov/fdc/v1';
    private $cacheSeconds = 60 * 60 * 24;

    public function __construct()
    {
        $this->apiKey = config('services.usda.api_key');
    }

    public function hasApiKey(): bool
    {
        return filled($this->apiKey);
    }

    public function searchFood($ingredientName)
    {
        $ingredientName = trim((string) $ingredientName);

        if ($ingredientName === '' || !$this->hasApiKey()) {
            return null;
        }

        $cacheKey = 'usda_food_' . md5(mb_strtolower($ingredientName));

        return Cache::remember($cacheKey, $this->cacheSeconds, function () use ($ingredientName) {
            try {
                $response = Http::timeout(10)
                    ->acceptJson()
                    ->get("{$this->baseUrl}/foods/search", [
                        'query' => $ingredientName,
                        'api_key' => $this->apiKey,
                        'pageSize' => 1,
                    ]);

                if (!$response->successful()) {
                    \Log::warning('USDA API request failed.', [
                        'ingredient' => $ingredientName,
                        'status' => $response->status(),
                    ]);

                    return null;
                }

                $foods = $response->json('foods', []);
                if (!isset($foods[0]) || !is_array($foods[0])) {
                    return null;
                }

                return $this->extractFoodData($foods[0]);
            } catch (\Throwable $e) {
                \Log::error('USDA API error: ' . $e->getMessage(), [
                    'ingredient' => $ingredientName,
                ]);
            }

            return null;
        });
    }

    public function getCaloriesPerHundredGrams($ingredientName)
    {
        $food = $this->searchFood($ingredientName);

        return (float) ($food['calories'] ?? 0);
    }

    public function calculateCalories($ingredientName, $quantity)
    {
        return $this->buildIngredientNutrition($ingredientName, $quantity)['calories'];
    }

    public function calculateRecipeCalories($ingredients)
    {
        $totalCalories = 0;
        $ingredientDetails = [];

        foreach ($ingredients as $ingredient) {
            $ingredientName = trim((string) ($ingredient['name'] ?? ''));
            $quantity = (float) ($ingredient['quantity'] ?? 100);

            if ($ingredientName === '') {
                continue;
            }

            $ingredientData = $this->buildIngredientNutrition($ingredientName, $quantity);
            $totalCalories += $ingredientData['calories'];
            $ingredientDetails[] = $ingredientData;
        }

        return [
            'totalCalories' => round($totalCalories, 2),
            'ingredients' => $ingredientDetails,
        ];
    }

    private function extractFoodData(array $food): array
    {
        $nutrients = $food['foodNutrients'] ?? [];
        $calories = $this->extractCaloriesFromNutrients($nutrients);

        return [
            'fdc_id' => $food['fdcId'] ?? null,
            'description' => $food['description'] ?? '',
            'calories' => round((float) $calories, 2),
        ];
    }

    private function extractCaloriesFromNutrients(array $nutrients): float
    {
        $fallbackCalories = null;

        foreach ($nutrients as $nutrient) {
            if (!$this->isEnergyNutrient($nutrient)) {
                continue;
            }

            $value = (float) ($nutrient['value'] ?? 0);
            if ($value <= 0) {
                continue;
            }

            $unit = strtolower(trim((string) ($nutrient['unitName'] ?? '')));
            $nutrientId = (int) ($nutrient['nutrientId'] ?? 0);
            $nutrientNumber = trim((string) ($nutrient['nutrientNumber'] ?? ''));

            if ($nutrientId === 1008 || $nutrientNumber === '1008' || str_contains($unit, 'kcal')) {
                return $value;
            }

            if (str_contains($unit, 'kj')) {
                $fallbackCalories = $value / 4.184;
                continue;
            }

            $fallbackCalories = $value;
        }

        return (float) ($fallbackCalories ?? 0);
    }

    private function isEnergyNutrient(array $nutrient): bool
    {
        $name = strtolower(trim((string) ($nutrient['nutrientName'] ?? '')));

        return $name !== '' && str_contains($name, 'energy');
    }

    private function buildIngredientNutrition($ingredientName, $quantity): array
    {
        $normalizedName = trim((string) $ingredientName);
        $normalizedQuantity = max(0, (float) $quantity);
        $food = $this->searchFood($normalizedName);
        $caloriesPer100g = (float) ($food['calories'] ?? 0);
        $calories = $caloriesPer100g > 0
            ? ($caloriesPer100g * $normalizedQuantity) / 100
            : 0;

        return [
            'name' => $normalizedName,
            'quantity' => round($normalizedQuantity, 2),
            'calories_per_100g' => round($caloriesPer100g, 2),
            'calories' => round($calories, 2),
            'matched_food' => $food['description'] ?? null,
            'fdc_id' => $food['fdc_id'] ?? null,
            'found' => $food !== null,
        ];
    }
}
