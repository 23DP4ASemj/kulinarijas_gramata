<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\Rating;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RecipeService
{
    public function paginate(Request $request, ?int $viewerId = null): LengthAwarePaginator
    {
        $perPage = (int) $request->query('per_page', 9);
        $page = (int) $request->query('page', 1);
        $perPage = max(1, min(50, $perPage));
        $page = max(1, $page);

        $query = Recipe::listQuery($viewerId);

        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $query->where(function ($inner) use ($q) {
                $inner->where('title', 'like', '%'.$q.'%')
                    ->orWhere('description', 'like', '%'.$q.'%');
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('ingredient')) {
            $ingredient = trim((string) $request->query('ingredient'));
            if ($ingredient !== '') {
                $query->whereHas('ingredients', function ($inner) use ($ingredient) {
                    $inner->where('name', 'like', '%'.$ingredient.'%');
                });
            }
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->query('difficulty'));
        }

        $sort = $request->query('sort', 'newest');
        if ($sort === 'rating') {
            $query->orderByDesc(DB::raw('COALESCE(ratings_avg_value, 0)'));
        } elseif ($sort === 'popularity') {
            $query->orderByDesc('favorites_count');
        } else {
            $query->orderByDesc('recipes.created_at');
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function getDetail(int $id, ?int $viewerId = null): Recipe
    {
        $recipe = Recipe::with(['author:id,name', 'category:id,name', 'ingredients:id,name', 'steps:id,recipe_id,step_number,instruction'])
            ->withAvg('ratings', 'value')
            ->withCount('ratings')
            ->withCount('favorites')
            ->findOrFail($id);

        if ($viewerId) {
            $recipe->setAttribute(
                'is_favorited_by_me',
                $recipe->favorites()->where('user_id', $viewerId)->exists()
            );
            $recipe->setAttribute(
                'my_rating',
                Rating::where('recipe_id', $recipe->id)->where('user_id', $viewerId)->value('value')
            );
        } else {
            $recipe->setAttribute('is_favorited_by_me', false);
            $recipe->setAttribute('my_rating', null);
        }

        return $recipe;
    }

    public function getSimilar(int $id, ?int $viewerId = null, int $limit = 6)
    {
        $recipe = Recipe::with('ingredients:id')->findOrFail($id);
        $ingredientIds = $recipe->ingredients->pluck('id')->all();
        $limit = max(1, min(12, $limit));

        $query = Recipe::listQuery($viewerId)
            ->where('recipes.id', '!=', $recipe->id);

        if ($recipe->category_id) {
            $query->where('recipes.category_id', $recipe->category_id);
        }

        if (!empty($ingredientIds)) {
            $query->withCount(['ingredients as overlap_ingredients_count' => function ($inner) use ($ingredientIds) {
                $inner->whereIn('ingredients.id', $ingredientIds);
            }])->orderByDesc('overlap_ingredients_count');
        }

        return $query
            ->orderByDesc(DB::raw('COALESCE(ratings_avg_value, 0)'))
            ->orderByDesc('recipes.created_at')
            ->limit($limit)
            ->get();
    }

    public function create(User $user, array $data): Recipe
    {
        $imagePath = null;
        $imageUrl = trim((string) ($data['image_url'] ?? ''));

        if (!empty($data['image']) && $data['image'] instanceof UploadedFile) {
            $imagePath = $this->storeImage($data['image']);
            $imageUrl = '';
        }

        $recipe = Recipe::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'category_id' => $data['category_id'],
            'user_id' => $user->id,
            'prep_time_minutes' => $data['prep_time_minutes'] ?? 0,
            'difficulty' => $data['difficulty'] ?? null,
            'quantity' => $data['quantity'] ?? null,
            'image_path' => $imagePath,
            'image_url' => $imageUrl !== '' ? $imageUrl : null,
        ]);

        if (!empty($data['ingredients'])) {
            $this->syncIngredients($recipe, $data['ingredients']);
        }

        $this->syncSteps($recipe, $data['steps'] ?? []);

        return $recipe->fresh(['author:id,name', 'category:id,name', 'ingredients:id,name', 'steps:id,recipe_id,step_number,instruction']);
    }

    public function update(Recipe $recipe, array $data): Recipe
    {
        $shouldRemoveImage = (bool) ($data['remove_image'] ?? false);
        $hasNewImage = !empty($data['image']) && $data['image'] instanceof UploadedFile;
        $hasIncomingImageUrl = array_key_exists('image_url', $data);
        $incomingImageUrl = $hasIncomingImageUrl ? trim((string) ($data['image_url'] ?? '')) : null;

        if ($shouldRemoveImage || $hasNewImage || $hasIncomingImageUrl) {
            $this->deleteImage($recipe->image_path);
            $recipe->image_path = null;
        }

        if ($shouldRemoveImage) {
            $recipe->image_url = null;
        }

        if ($hasNewImage) {
            $recipe->image_path = $this->storeImage($data['image']);
            $recipe->image_url = null;
        } elseif ($hasIncomingImageUrl) {
            $recipe->image_url = $incomingImageUrl !== '' ? $incomingImageUrl : null;
        }

        $recipe->fill([
            'title' => $data['title'] ?? $recipe->title,
            'description' => array_key_exists('description', $data) ? ($data['description'] ?? '') : $recipe->description,
            'category_id' => $data['category_id'] ?? $recipe->category_id,
            'prep_time_minutes' => array_key_exists('prep_time_minutes', $data)
                ? ($data['prep_time_minutes'] ?? 0)
                : $recipe->prep_time_minutes,
            'difficulty' => array_key_exists('difficulty', $data) ? $data['difficulty'] : $recipe->difficulty,
            'quantity' => array_key_exists('quantity', $data) ? $data['quantity'] : $recipe->quantity,
        ]);
        $recipe->save();

        if (array_key_exists('ingredients', $data)) {
            $this->syncIngredients($recipe, $data['ingredients'] ?? []);
        }

        if (array_key_exists('steps', $data)) {
            $this->syncSteps($recipe, $data['steps'] ?? []);
        }

        return $recipe->fresh(['author:id,name', 'category:id,name', 'ingredients:id,name', 'steps:id,recipe_id,step_number,instruction']);
    }

    public function delete(Recipe $recipe): void
    {
        $this->deleteImage($recipe->image_path);
        $recipe->delete();
    }

    private function syncIngredients(Recipe $recipe, array $ingredients): void
    {
        $syncData = [];

        foreach ($ingredients as $item) {
            $name = trim((string) ($item['name'] ?? ''));
            if ($name === '') {
                continue;
            }

            $ingredient = Ingredient::firstOrCreate(['name' => $name]);
            $syncData[$ingredient->id] = [
                'amount' => $item['amount'] ?? null,
                'unit' => $item['unit'] ?? null,
            ];
        }

        $recipe->ingredients()->sync($syncData);
    }

    private function syncSteps(Recipe $recipe, array $steps): void
    {
        $rows = [];
        $stepNumber = 1;

        foreach ($steps as $instruction) {
            $text = trim((string) $instruction);
            if ($text === '') {
                continue;
            }

            $rows[] = [
                'step_number' => $stepNumber,
                'instruction' => $text,
            ];
            $stepNumber++;
        }

        $recipe->steps()->delete();

        if (!empty($rows)) {
            $recipe->steps()->createMany($rows);
        }
    }

    private function storeImage(UploadedFile $image): string
    {
        return $image->store('recipes', 'public');
    }

    private function deleteImage(?string $path): void
    {
        if (!$path) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
